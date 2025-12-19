import { test, expect } from '@playwright/test';
import { crawlInternalLinks } from '../utils/crawlInternalLinks';
import { LinkValidationSummary } from '../utils/validateInternalLinks';
import { DEMOS } from '../utils/constants';

test.describe('Safe internal link crawl', () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – crawl internal links safely`, async ({ page }) => {
      test.setTimeout(180000);

      const result: LinkValidationSummary =
        await crawlInternalLinks(page, demo.baseUrl);

      console.log(
        `Crawl summary for ${demo.name}: ` +
        `checked=${result.checked}, ` +
        `failed=${result.failed}, ` +
        `skipped=${result.skipped}`
      );

      if (result.failures.length) {
        console.log('Failures:');
        result.failures.forEach(f => console.log(` - ${f}`));
      }

      expect(result.checked).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });
  }
});
