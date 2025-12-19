import { test, expect } from '@playwright/test';
import { crawlInternalLinks } from '../utils/crawlInternalLinks';
import { LinkValidationSummary } from '../utils/validateInternalLinks';
import { DEMOS } from '../utils/constants';

test.describe('Safe internal link crawl', () => {
  for (const demo of DEMOS) {
    test(`${demo.name} – crawl internal links safely`, async ({ page }) => {
      test.setTimeout(180000);

      const dryRun = process.env.CRAWL_DRY_RUN === 'true';

      const result: LinkValidationSummary =
        await crawlInternalLinks(page, demo.baseUrl, { dryRun });

      console.log(`Crawl summary for ${demo.name}`);
      if (dryRun) {
        console.log('- mode: dry-run (discover only)');
      }
      console.log(`- checked: ${result.checked}`);
      console.log(`- failed: ${result.failed}`);
      console.log(`- skipped: ${result.skipped}`);

      if (result.failures.length) {
        console.log('Failures:');
        result.failures.forEach(f => console.log(` - ${f}`));
      }

      if (result.notes?.length) {
        console.log('Notes:');
        result.notes.forEach(n => console.log(` - ${n}`));
      }

      expect(result.checked).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });
  }
});
