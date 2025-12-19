import { Page } from "@playwright/test";
import { isAllowedPath } from "../helpers/pathHelper";

export interface LinkValidationSummary {
  checked: number;
  failed: number;
  skipped: number;
  failures: string[];
  notes?: string[];
}

export async function validateInternalLinks(
  page: Page,
  pageUrl: string
): Promise<LinkValidationSummary> {
  const summary: LinkValidationSummary = {
    checked: 0,
    failed: 0,
    skipped: 0,
    failures: [],
    notes: [],
  };

  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

  const internalLinks = await page.$$eval(
    "a[href]",
    (anchors, baseUrl) =>
      anchors
        .map((a) => ({
          href: a.getAttribute("href"),
          text: a.textContent?.trim() ?? "",
        }))
        .filter((a) => {
          if (!a.href) return false;
          if (a.href.startsWith("#")) return false;
          if (a.href.startsWith("javascript:")) return false;
          if (a.href.startsWith("mailto:")) return false;

          try {
            const url = new URL(a.href, baseUrl);

            if (url.origin !== new URL(baseUrl).origin) {
              return false;
            }

            return isAllowedPath(url.pathname);
          } catch {
            return false;
          }
        }),
    pageUrl
  );

  const MAX_LINKS = 10;
  const linksToCheck = internalLinks.slice(0, MAX_LINKS);
  summary.skipped = internalLinks.length - linksToCheck.length;

  for (const link of linksToCheck) {
    summary.checked++;

    try {
      const response = await page.goto(
        new URL(link.href!, pageUrl).toString(),
        { waitUntil: "domcontentloaded", timeout: 5000 }
      );

      if (!response || response.status() >= 400) {
        summary.failed++;
        summary.failures.push(`"${link.text}" → HTTP ${response?.status()}`);
      }
    } catch {
      summary.failed++;
      summary.failures.push(`"${link.text}" → navigation failed`);
    }
  }

  return summary;
}
