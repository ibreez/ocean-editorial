import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

/**
 * Dynamic robots.txt Generation for Ocean Editorial
 *
 * Rules:
 * - Allows indexing of all public editorial stories, categories, and live coverage.
 * - Disallows private browser-local utility pages (/saved).
 * - Disallows dynamic search query parameters (/search, /search/*) to avoid crawler traps.
 * - Disallows developer verification routes (/typography-test).
 * - References canonical dynamic sitemap XML.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/saved",
          "/saved/",
          "/search",
          "/search/",
          "/search?*",
          "/typography-test",
          "/typography-test/",
          "/admin",
          "/admin/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
