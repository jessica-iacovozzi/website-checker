import * as dotenv from "dotenv";

dotenv.config();

type DemoKeyConfig = {
  nameKey: string;
  baseUrlKey: string;
  productPathKey: string;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const buildDemo = ({
  nameKey,
  baseUrlKey,
  productPathKey,
}: DemoKeyConfig) => ({
  name: requireEnv(nameKey),
  baseUrl: requireEnv(baseUrlKey),
  productPath: requireEnv(productPathKey),
});

export const DEMOS = [
  buildDemo({
    nameKey: "SHOPIFY_STORE_NAME",
    baseUrlKey: "SHOPIFY_STORE_BASE_URL",
    productPathKey: "SHOPIFY_STORE_PRODUCT_PATH",
  })
];

export const CRAWL_LIMITS = {
  MAX_PAGES: 50,             // absolute hard stop (polite)
  MAX_DEPTH: 3,              // homepage -> section -> leaf
  DELAY_MS: 1200,            // pause between pages
  MAX_FAILURES: 6,           // stop early if things go bad
  NAVIGATION_TIMEOUT_MS: 5000,
  RETRY_COUNT: 1,
  DRY_RUN_NOTE_LIMIT: 50
};

export const ALLOWED_PATH_PREFIXES = [
  '/',
  '/products',
  '/collections',
  '/pages'
];

export const BLOCKED_PATH_PREFIXES = [
  '/cart',
  '/checkout',
  '/checkouts',
  '/account',
  '/search',
  '/customer_authentication',
  '/login',
  '/orders',
  '/gift_cards',
  '/policies',
  '/admin',
  '/apps'
];
