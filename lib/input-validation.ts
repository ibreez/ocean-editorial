/**
 * Input Validation & Security Utilities for Ocean Editorial
 *
 * Provides defense-in-depth sanitization, URL origin validation,
 * slug safety guards, and embed security checking.
 */

const SAFE_SLUG_REGEX = /^[a-zA-Z0-9_\-]+$/;

/**
 * Validates whether a route slug parameter is well-formed, preventing
 * path traversal, null bytes, control characters, or oversized inputs.
 */
export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (trimmed.length === 0 || trimmed.length > 120) return false;
  if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("\0")) {
    return false;
  }
  return SAFE_SLUG_REGEX.test(trimmed);
}

/**
 * Sanitizes user search inputs by enforcing max length, removing null bytes
 * and control characters, and normalizing whitespace.
 */
export function sanitizeSearchQuery(query: unknown, maxLength: number = 150): string {
  if (typeof query !== "string") return "";
  // Strip null bytes and non-printable control characters (except basic space)
  const cleaned = query.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  return cleaned.trim().slice(0, maxLength).replace(/\s+/g, " ");
}

/**
 * Verifies that a media URL uses a safe protocol (https, http, or local relative path)
 * and does not execute scripts via javascript:, data:, or other dangerous schemes.
 */
export function isSafeMediaUrl(urlStr: unknown): boolean {
  if (typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  // Local relative asset starting with a single slash (not protocol-relative //)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export interface SafeVideoResult {
  isEmbed: boolean;
  safeEmbedUrl: string | null;
  isSafeDirectVideo: boolean;
}

/**
 * Strict validation and origin allowlisting for video embeds (YouTube / Vimeo)
 * and direct HTML5 video elements.
 */
export function getSafeVideoEmbed(src: unknown): SafeVideoResult {
  if (typeof src !== "string" || !src.trim()) {
    return { isEmbed: false, safeEmbedUrl: null, isSafeDirectVideo: false };
  }

  const trimmed = src.trim();

  // Check if it's a safe local relative video asset
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { isEmbed: false, safeEmbedUrl: null, isSafeDirectVideo: true };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { isEmbed: false, safeEmbedUrl: null, isSafeDirectVideo: false };
    }

    const host = parsed.hostname.toLowerCase();

    // 1. YouTube Allowlist
    if (
      host === "www.youtube-nocookie.com" ||
      host === "www.youtube.com" ||
      host === "youtube.com"
    ) {
      // Direct embed path /embed/<id>
      if (parsed.pathname.startsWith("/embed/")) {
        const videoId = parsed.pathname.replace("/embed/", "").split("/")[0].split("?")[0];
        if (videoId && /^[a-zA-Z0-9_\-]+$/.test(videoId)) {
          return {
            isEmbed: true,
            safeEmbedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
            isSafeDirectVideo: false,
          };
        }
      }

      // Watch URL /watch?v=<id>
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_\-]+$/.test(v)) {
        return {
          isEmbed: true,
          safeEmbedUrl: `https://www.youtube-nocookie.com/embed/${v}`,
          isSafeDirectVideo: false,
        };
      }
    }

    // 2. youtu.be shortlinks
    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace(/^\//, "").split("/")[0].split("?")[0];
      if (videoId && /^[a-zA-Z0-9_\-]+$/.test(videoId)) {
        return {
          isEmbed: true,
          safeEmbedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          isSafeDirectVideo: false,
        };
      }
    }

    // 3. Vimeo Allowlist
    if (host === "player.vimeo.com" && parsed.pathname.startsWith("/video/")) {
      const vimeoId = parsed.pathname.replace("/video/", "").split("/")[0].split("?")[0];
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return {
          isEmbed: true,
          safeEmbedUrl: `https://player.vimeo.com/video/${vimeoId}`,
          isSafeDirectVideo: false,
        };
      }
    }

    if (host === "vimeo.com") {
      const vimeoId = parsed.pathname.replace(/^\//, "").split("/")[0].split("?")[0];
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return {
          isEmbed: true,
          safeEmbedUrl: `https://player.vimeo.com/video/${vimeoId}`,
          isSafeDirectVideo: false,
        };
      }
    }

    // Direct video file over HTTPS
    const isDirect = parsed.protocol === "https:";
    return {
      isEmbed: false,
      safeEmbedUrl: null,
      isSafeDirectVideo: isDirect,
    };
  } catch {
    return { isEmbed: false, safeEmbedUrl: null, isSafeDirectVideo: false };
  }
}
