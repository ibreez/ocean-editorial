import * as React from "react";

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Renders a secure, sanitized JSON-LD structured data script element.
 * Safely encodes '<', '>', '&', and Unicode line separators to prevent
 * script block injection and HTML entity breakouts.
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
