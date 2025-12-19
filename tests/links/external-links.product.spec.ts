import { test, expect } from "@playwright/test";
import { validateExternalLinks } from "../utils/validateExternalLinks";
import { DEMOS } from "../utils/constants";

test.describe("External links – product page", () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – product page external links`, async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);

      const productUrl = `${demo.baseUrl}${demo.productPath}`;

      const result = await validateExternalLinks(page, request, productUrl);

      console.log(
        `Product external links: checked=${result.checked}, failed=${result.failed}, skipped=${result.skipped}`
      );

      if (result.failures.length) {
        console.log("Product page external link failures:", result.failures);
      }

      expect(result.failures).toEqual([]);
    });
  }
});
