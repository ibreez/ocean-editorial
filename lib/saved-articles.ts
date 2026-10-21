"use client";

import * as React from "react";

const STORAGE_KEY = "ocean_saved_slugs";
const EVENT_NAME = "ocean-saved-articles-change";

export interface SavedArticleRecord {
  slug: string;
  savedAt: string; // ISO 8601 string
}

/**
 * Safely read saved article records from localStorage with fallback and validation.
 */
export function getSavedArticleRecords(): SavedArticleRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Normalizes both legacy string arrays and modern SavedArticleRecord arrays
    const records: SavedArticleRecord[] = [];
    const seenSlugs = new Set<string>();

    for (const item of parsed) {
      if (typeof item === "string" && item.trim()) {
        const slug = item.trim();
        if (!seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          records.push({
            slug,
            savedAt: new Date().toISOString(),
          });
        }
      } else if (item && typeof item === "object" && typeof item.slug === "string" && item.slug.trim()) {
        const slug = item.slug.trim();
        if (!seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          records.push({
            slug,
            savedAt: typeof item.savedAt === "string" ? item.savedAt : new Date().toISOString(),
          });
        }
      }
    }

    return records;
  } catch {
    // Storage access blocked (e.g. private browsing, cookies disabled) or malformed JSON
    return [];
  }
}

/**
 * Check if a specific article slug is saved.
 */
export function isArticleSaved(slug: string): boolean {
  if (!slug) return false;
  const records = getSavedArticleRecords();
  return records.some((r) => r.slug === slug);
}

/**
 * Save an article slug to localStorage.
 */
export function saveArticle(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;

  try {
    const records = getSavedArticleRecords();
    if (records.some((r) => r.slug === slug)) {
      return true; // Already saved
    }

    const newRecord: SavedArticleRecord = {
      slug,
      savedAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for same-window components and trigger storage event
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { slug, action: "save" } }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an article slug from saved storage.
 */
export function removeSavedArticle(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;

  try {
    const records = getSavedArticleRecords();
    const updated = records.filter((r) => r.slug !== slug);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { slug, action: "remove" } }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Toggle saved status for an article.
 * Returns the new state (true if now saved, false if removed).
 */
export function toggleSavedArticle(slug: string): boolean {
  if (isArticleSaved(slug)) {
    removeSavedArticle(slug);
    return false;
  } else {
    saveArticle(slug);
    return true;
  }
}

/**
 * Clear all saved articles from localStorage.
 */
export function clearAllSavedArticles(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: "clear" } }));
    return true;
  } catch {
    return false;
  }
}

/**
 * React hook to observe and manipulate saved articles state across components.
 * Hydration-safe using useSyncExternalStore or initial mounted state.
 */
export function useSavedArticles() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const subscribe = React.useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    const handleCustom = () => callback();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEY) {
        callback();
      }
    };

    window.addEventListener(EVENT_NAME, handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const getSnapshot = React.useCallback(() => {
    return JSON.stringify(getSavedArticleRecords());
  }, []);

  const getServerSnapshot = React.useCallback(() => {
    return "[]";
  }, []);

  const rawJson = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const records: SavedArticleRecord[] = React.useMemo(() => {
    if (!mounted) return [];
    try {
      return JSON.parse(rawJson);
    } catch {
      return [];
    }
  }, [mounted, rawJson]);

  const savedSlugs = React.useMemo(() => records.map((r) => r.slug), [records]);

  const isSaved = React.useCallback(
    (slug: string) => {
      if (!mounted) return false;
      return savedSlugs.includes(slug);
    },
    [mounted, savedSlugs]
  );

  const toggle = React.useCallback((slug: string) => {
    return toggleSavedArticle(slug);
  }, []);

  const remove = React.useCallback((slug: string) => {
    return removeSavedArticle(slug);
  }, []);

  const clear = React.useCallback(() => {
    return clearAllSavedArticles();
  }, []);

  return {
    records,
    savedSlugs,
    count: savedSlugs.length,
    isLoaded: mounted,
    isSaved,
    toggle,
    remove,
    clear,
  };
}
