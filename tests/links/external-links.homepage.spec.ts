import { test, expect } from "@playwright/test";
import { validateExternalLinks } from "../utils/validateExternalLinks";
import { DEMOS } from "../utils/constants";

test.describe("External links – homepage", () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – homepage external links`, async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);

      const result = await validateExternalLinks(page, request, demo.baseUrl);

      console.log(
        `Homepage external links: checked=${result.checked}, failed=${result.failed}, skipped=${result.skipped}`
      );

      if (result.failures.length) {
        console.log("Homepage external link failures:", result.failures);
      }

      expect(result.failures).toEqual([]);
    });
  }
});
