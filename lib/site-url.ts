/**
 * Canonical Site URL Resolution Utility
 * 
 * Determines the authoritative base URL for metadata, sitemaps, canonical tags,
 * and social preview cards. Uses environment configuration with strict protocol
 * validation and safe fallbacks.
 */

const DEFAULT_EDITORIAL_ORIGIN = "https://oceaneditorial.mv";

function validateOrigin(urlStr?: string): string | null {
  if (!urlStr || !urlStr.trim()) return null;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return `${parsed.protocol}//${parsed.host}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function getBaseUrl(): string {
  // 1. Explicit production site URL
  const siteUrl = validateOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (siteUrl) return siteUrl;

  // 2. AI Studio container APP_URL
  const appUrl = validateOrigin(process.env.APP_URL);
  if (appUrl) return appUrl;

  // 3. Vercel deployment URL if applicable
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim()) {
    const vercel = validateOrigin(`https://${process.env.VERCEL_URL.trim()}`);
    if (vercel) return vercel;
  }

  // 4. Safe default editorial domain fallback (never leaves URLs broken)
  return DEFAULT_EDITORIAL_ORIGIN;
}

/**
 * Returns a fully-qualified absolute URL for a given relative route path.
 * Defends against protocol-relative attacks (//attacker.com) and unsafe schemes.
 */
export function getAbsoluteUrl(path: string = "/"): string {
  if (typeof path !== "string") return getBaseUrl();
  const trimmed = path.trim();

  // If already absolute with safe protocol
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  // Block protocol-relative attacks like "//evil.com"
  const sanitizedPath = trimmed.startsWith("//")
    ? `/${trimmed.replace(/^\/+/, "")}`
    : trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  const base = getBaseUrl();
  return `${base}${sanitizedPath}`;
}
