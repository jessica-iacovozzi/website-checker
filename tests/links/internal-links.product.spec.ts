import { test, expect } from "@playwright/test";
import { validateInternalLinks } from "../utils/validateInternalLinks";
import { DEMOS } from "../utils/constants";

test.describe("Internal links – product page", () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – product page internal links`, async ({ page }) => {
      test.setTimeout(60000);

      const productUrl = `${demo.baseUrl}${demo.productPath}`;

      const result = await validateInternalLinks(page, productUrl);

      console.log(
        `Product internal links: checked=${result.checked}, failed=${result.failed}, skipped=${result.skipped}`
      );

      if (result.failures.length) {
        console.log("Product page internal link failures:", result.failures);
      }

      expect(result.failures).toEqual([]);
    });
  }
});
