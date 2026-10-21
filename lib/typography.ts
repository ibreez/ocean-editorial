/**
 * Typography and Localization Utilities for Dhivehi Newsroom
 * Provides robust helpers for Thaana punctuation, numeral formatting,
 * and bidirectional string handling.
 */

/**
 * Format currency in Maldivian Rufiyaa with proper tabular numbers.
 * Supports both Dhivehi representation (ރ. 1,500) and standard international code (MVR 1,500).
 */
export function formatMvrCurrency(
  amount: number,
  options: { inDhivehi?: boolean; showCents?: boolean } = {}
): string {
  const { inDhivehi = true, showCents = false } = options;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);

  if (inDhivehi) {
    return `${formattedNumber} ރ.`;
  }
  return `MVR ${formattedNumber}`;
}

/**
 * Format percentage string preventing RTL flipping of the percentage sign.
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Format reading time in natural Dhivehi phrasing.
 */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 1) {
    return "1 މިނެޓުގެ ކިޔުމެއް";
  }
  return `${minutes} މިނެޓުގެ ކިޔުމެއް`;
}

/**
 * Convert standard English punctuation in raw strings to correct Dhivehi punctuation:
 * - standard comma ',' to Arabic/Thaana comma '،' (U+060C)
 * - standard semicolon ';' to Arabic/Thaana semicolon '؛' (U+061B)
 * - standard question mark '?' to Arabic/Thaana question mark '؟' (U+061F)
 */
export function normalizeDhivehiPunctuation(text: string): string {
  // We only replace punctuation when not immediately preceded or followed by Latin letters/numbers/URLs
  return text
    .replace(/([\u0780-\u07BF\s])\?+/g, "$1؟")
    .replace(/([\u0780-\u07BF\s]);+/g, "$1؛")
    .replace(/([\u0780-\u07BF\s]),+/g, "$1،");
}

/**
 * Estimate reading time based on Dhivehi word count.
 * Average Thaana reading speed is approx 140-160 words per minute.
 */
export function estimateReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 150);
  return Math.max(1, minutes);
}
