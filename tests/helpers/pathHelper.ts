import { BLOCKED_PATH_PREFIXES, ALLOWED_PATH_PREFIXES } from "../utils/constants";

export function isAllowedPath(pathname: string): boolean {
  if (BLOCKED_PATH_PREFIXES.some(p => pathname.startsWith(p))) {
    return false;
  }

  return ALLOWED_PATH_PREFIXES.some(p =>
    pathname === p || pathname.startsWith(p)
  );
}

export function normalizeUrl(url: URL): string {
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}
