import { test, expect } from "@playwright/test";
import { validateInternalLinks } from "../utils/validateInternalLinks";
import { DEMOS } from "../utils/constants";

test.describe("Internal links – homepage", () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – homepage internal links`, async ({ page }) => {
      test.setTimeout(60000);

      const result = await validateInternalLinks(page, demo.baseUrl);

      console.log(
        `Homepage internal links: checked=${result.checked}, failed=${result.failed}, skipped=${result.skipped}`
      );

      if (result.failures.length) {
        console.log("Homepage internal link failures:", result.failures);
      }

      expect(result.failures).toEqual([]);
    });
  }
});
