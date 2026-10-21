import * as React from "react";
import { cn } from "@/lib/utils";

export interface BdiProps extends React.HTMLAttributes<HTMLElement> {
  dir?: "ltr" | "rtl" | "auto";
  as?: "bdi" | "span" | "code";
}

/**
 * Bdi component isolates mixed bidirectional text (e.g. English names, URLs,
 * phone numbers, codes, or dates) so surrounding Thaana RTL text and punctuation
 * do not cause incorrect glyph ordering or visual corruption.
 */
export function Bdi({
  children,
  className,
  dir = "ltr",
  as: Component = "bdi",
  ...props
}: BdiProps) {
  return (
    <Component
      dir={dir}
      className={cn(
        dir === "ltr" && "font-latin inline-block text-left",
        "unicode-bidi-isolate",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
