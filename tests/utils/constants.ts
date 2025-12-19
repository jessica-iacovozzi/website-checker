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
  MAX_PAGES: 20,          // absolute hard stop
  MAX_DEPTH: 2,           // homepage -> section -> leaf
  DELAY_MS: 1000,          // polite pause between pages
  MAX_FAILURES: 5         // stop early if things go bad
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
  '/login'
];
