import { CrawlItem } from "../types";
import { Page } from "@playwright/test";
import { LinkValidationSummary } from "./validateInternalLinks";
import { CRAWL_LIMITS } from "./constants";
import { normalizeUrl, isAllowedPath } from "../helpers/pathHelper";

type CrawlOptions = {
  dryRun?: boolean;
};

type VisitResult = {
  status?: number;
  contentType?: string;
};

export async function crawlInternalLinks(
  page: Page,
  startUrl: string,
  options: CrawlOptions = {}
): Promise<LinkValidationSummary> {
  const { dryRun = false } = options;

  const summary: LinkValidationSummary = {
    checked: 0,
    failed: 0,
    skipped: 0,
    failures: [],
    notes: [],
  };

  const queue: CrawlItem[] = [{ url: startUrl, depth: 0 }];
  const visited = new Set<string>();

  const visit = async (targetUrl: string): Promise<VisitResult> => {
    let lastStatus: number | undefined;
    for (let attempt = 0; attempt <= CRAWL_LIMITS.RETRY_COUNT; attempt++) {
      try {
        const response = await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: CRAWL_LIMITS.NAVIGATION_TIMEOUT_MS,
        });

        lastStatus = response?.status();

        if (lastStatus && lastStatus >= 500 && attempt < CRAWL_LIMITS.RETRY_COUNT) {
          await page.waitForTimeout(200);
          continue;
        }

        return {
          status: lastStatus,
          contentType: response?.headers()?.["content-type"],
        };
      } catch {
        if (attempt < CRAWL_LIMITS.RETRY_COUNT) {
          await page.waitForTimeout(200);
          continue;
        }
        throw new Error("navigation failed");
      }
    }

    return { status: lastStatus };
  };

  while (
    queue.length &&
    visited.size < CRAWL_LIMITS.MAX_PAGES &&
    summary.failed < CRAWL_LIMITS.MAX_FAILURES
  ) {
    const { url, depth } = queue.shift()!;

    if (visited.has(url)) {
      summary.skipped++;
      continue;
    }

    visited.add(url);
    summary.checked++;

    try {
      const { status, contentType } = await visit(url);

      if (!status || status >= 400) {
        summary.failed++;
        summary.failures.push(
          `${url} → HTTP ${status ?? "unknown"}${contentType ? ` (${contentType})` : ""}`
        );
        continue;
      }

      if (depth >= CRAWL_LIMITS.MAX_DEPTH || dryRun) {
        if (dryRun && summary.notes && summary.notes.length < CRAWL_LIMITS.DRY_RUN_NOTE_LIMIT) {
          summary.notes.push(`Discovered (not crawled): ${url}`);
        }
        continue;
      }

      // Extract next internal links
      const links = await page.$$eval(
        "a[href]",
        (anchors, base) =>
          anchors
            .map((a) => a.getAttribute("href"))
            .filter((href) => {
              if (!href) return false;
              if (href.startsWith("#")) return false;
              if (href.startsWith("javascript:")) return false;
              if (href.startsWith("mailto:")) return false;

              try {
                const currentUrl = new URL(href, base);
                return currentUrl.origin === new URL(base).origin;
              } catch {
                return false;
              }
            }),
        url
      );

      for (const href of links) {
        const nextUrl = normalizeUrl(new URL(href!, startUrl));

        const pathname = new URL(nextUrl).pathname;

        if (!isAllowedPath(pathname)) {
          summary.skipped++;
          continue;
        }

        if (!visited.has(nextUrl)) {
          queue.push({ url: nextUrl, depth: depth + 1 });
          if (dryRun && summary.notes && summary.notes.length < CRAWL_LIMITS.DRY_RUN_NOTE_LIMIT) {
            summary.notes.push(`Queued (not visited): ${nextUrl}`);
          }
        }
      }
    } catch (error) {
      summary.failed++;
      summary.failures.push(`${url} → navigation failed`);
      if (summary.notes && summary.notes.length < CRAWL_LIMITS.DRY_RUN_NOTE_LIMIT) {
        summary.notes.push(`Error at ${url}: ${String((error as Error)?.message ?? error)}`);
      }
    }

    // Rate limiting
    await page.waitForTimeout(CRAWL_LIMITS.DELAY_MS);
  }

  return summary;
}
