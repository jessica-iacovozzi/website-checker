# Website Crawler (Playwright)

Link-checking Playwright tests to verify internal and external links for configured sites. Crawls pages politely, skips risky paths, and fails fast when links break.

## Features
- **Homepage link checks:** Internal and external link validation.
- **Crawl smoke:** Depth-limited, rate-limited crawl of internal links.
- **Configurable targets:** Links are provided via environment variables (no URLs committed).
- **Reports:** Playwright HTML reports in `playwright-report/` after a run.

## Requirements
- Node.js >= 18
- npm
- A `.env` file with target site values (kept out of git)

## Setup
1) Install dependencies:
```bash
npm install
```
2) Configure environment variables (copy and fill):
```bash
cp .env.example .env
```
Fill `.env` with your target site values.

### Environment variables
| Key | Description |
| --- | --- |
| `SHOPIFY_STORE_NAME` | Display name for logs |
| `SHOPIFY_STORE_BASE_URL` | Base URL to test (e.g., `https://example.com`) |
| `SHOPIFY_STORE_PRODUCT_PATH` | Product path for product-page link checks (e.g., `/collections/all`) |

> `.env` is git-ignored; keep real URLs out of commits.

## Running tests
- Homepage links (internal + external):
```bash
npm run test:qa
```
- Crawl (depth/limit governed by constants):
```bash
npm run test:crawl
```
Reports: `playwright-report/` (HTML) and `test-results/` (artifacts).

## Configuration knobs
- Targets: `DEMOS` in `tests/utils/constants.ts` (environment-driven) @tests/utils/constants.ts#5-37
- Crawl limits (depth, delay, max pages, fail-fast): `CRAWL_LIMITS` @tests/utils/constants.ts#39-44
- Allowed/blocked path prefixes: `ALLOWED_PATH_PREFIXES`, `BLOCKED_PATH_PREFIXES` @tests/utils/constants.ts#46-60

To add another target, add a new block in `constants.ts` and new env keys, then set them in `.env`.

## Notes
- Playwright config: `playwright.config.ts` (1 worker, retain traces/screenshots on failure).
- If Playwright browsers are missing, run `npx playwright install --with-deps`.
