import { CrawlItem } from "../types";
import { Page } from "@playwright/test";
import { LinkValidationSummary } from './validateInternalLinks';
import { CRAWL_LIMITS } from "./constants";
import { normalizeUrl, isAllowedPath } from "../helpers/pathHelper";

export async function crawlInternalLinks(
  page: Page,
  startUrl: string
): Promise<LinkValidationSummary> {
  const summary: LinkValidationSummary = {
    checked: 0,
    failed: 0,
    skipped: 0,
    failures: []
  };

  const queue: CrawlItem[] = [{ url: startUrl, depth: 0 }];
  const visited = new Set<string>();

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
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });

      if (!response || response.status() >= 400) {
        summary.failed++;
        summary.failures.push(`${url} → HTTP ${response?.status()}`);
        continue;
      }

      if (depth >= CRAWL_LIMITS.MAX_DEPTH) {
        continue;
      }

      // Extract next internal links
      const links = await page.$$eval(
        'a[href]',
        (anchors, base) =>
          anchors
            .map(a => a.getAttribute('href'))
            .filter(href => {
              if (!href) return false;
              if (href.startsWith('#')) return false;
              if (href.startsWith('javascript:')) return false;
              if (href.startsWith('mailto:')) return false;

              try {
                const url = new URL(href, base);
                return url.origin === new URL(base).origin;
              } catch {
                return false;
              }
            }),
        url
      );

      for (const href of links) {
        const nextUrl = normalizeUrl(
          new URL(href!, startUrl)
        );

        const pathname = new URL(nextUrl).pathname;

        if (!isAllowedPath(pathname)) {
          summary.skipped++;
          continue;
        }

        if (!visited.has(nextUrl)) {
          queue.push({ url: nextUrl, depth: depth + 1 });
        }
      }
    } catch {
      summary.failed++;
      summary.failures.push(`${url} → navigation failed`);
    }

    // Rate limiting
    await page.waitForTimeout(CRAWL_LIMITS.DELAY_MS);
  }

  return summary;
}
