import { Page, APIRequestContext } from "@playwright/test";
import { isAllowedPath } from "../helpers/pathHelper";

export interface LinkValidationSummary {
  checked: number;
  failed: number;
  skipped: number;
  failures: string[];
}

export async function validateExternalLinks(
  page: Page,
  request: APIRequestContext,
  pageUrl: string
): Promise<LinkValidationSummary> {
  const summary: LinkValidationSummary = {
    checked: 0,
    failed: 0,
    skipped: 0,
    failures: [],
  };

  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

  const externalLinks = await page.$$eval(
    "a[href]",
    (anchors, baseUrl) =>
      Array.from(
        new Set(
          anchors
            .map((a) => a.getAttribute("href"))
            .filter((href) => {
              if (!href) return false;
              if (href.startsWith("#")) return false;
              if (href.startsWith("javascript:")) return false;
              if (href.startsWith("mailto:")) return false;

              try {
                const url = new URL(href, baseUrl);

                if (url.origin === new URL(baseUrl).origin) {
                  return isAllowedPath(url.pathname);
                }

                return true;
              } catch {
                return false;
              }
            })
        )
      ),
    pageUrl
  );

  for (const link of externalLinks) {
    if (typeof link !== "string") {
      summary.skipped++;
      continue;
    }

    summary.checked++;

    try {
      let response = await request.head(link, {
        timeout: 5000,
        failOnStatusCode: false,
      });

      if (response.status() === 403 || response.status() === 405) {
        response = await request.get(link, {
          timeout: 5000,
          failOnStatusCode: false,
        });
      }

      if (response.status() >= 400) {
        summary.failed++;
        summary.failures.push(`${link} → HTTP ${response.status()}`);
      }
    } catch {
      summary.failed++;
      summary.failures.push(`${link} → request failed`);
    }
  }

  return summary;
}
