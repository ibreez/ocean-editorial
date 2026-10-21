"use client";

import * as React from "react";
import { Bookmark, Check } from "lucide-react";
import { useSavedArticles } from "@/lib/saved-articles";
import { cn } from "@/lib/utils";

export interface BookmarkButtonProps {
  slug: string;
  title?: string;
  variant?: "button" | "icon" | "card";
  className?: string;
  showFeedback?: boolean;
  onToggle?: (newState: boolean) => void;
}

export function BookmarkButton({
  slug,
  title,
  variant = "button",
  className,
  showFeedback = true,
  onToggle,
}: BookmarkButtonProps) {
  const { isSaved, toggle } = useSavedArticles();
  const saved = isSaved(slug);
  const [justToggled, setJustToggled] = React.useState<"saved" | "removed" | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = toggle(slug);
    if (onToggle) {
      onToggle(newState);
    }

    if (showFeedback) {
      setJustToggled(newState ? "saved" : "removed");
      setTimeout(() => {
        setJustToggled(null);
      }, 2000);
    }
  };

  const labelText = saved ? "ރައްކާކުރެވިފައި" : "ރައްކާކުރޭ";
  const ariaLabel = saved
    ? `«${title || "ޚަބަރު"}» ރައްކާކުރި ލިސްޓުން އުނިކުރައްވާ`
    : `«${title || "ޚަބަރު"}» ފަހުން ވިދާޅުވުމަށް ރައްކާކުރައްވާ`;

  // Screen reader live status element helper
  const srAnnouncement = (
    <span className="sr-only" role="status" aria-live="polite">
      {justToggled === "saved"
        ? `«${title || "ޚަބަރު"}» ރައްކާކުރެވިއްޖެ`
        : justToggled === "removed"
        ? `«${title || "ޚަބަރު"}» ރައްކާކުރި ލިސްޓުން އުނިކުރެވިއްޖެ`
        : ""}
    </span>
  );

  // Variant: Floating/inline Card Action
  if (variant === "card") {
    return (
      <div className="relative inline-flex items-center">
        {srAnnouncement}
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={saved}
          aria-label={ariaLabel}
          title={labelText}
          suppressHydrationWarning
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] touch-manipulation",
            saved
              ? "bg-[#123B3A] text-white shadow-xs"
              : "bg-white/95 hover:bg-white text-[#53635F] hover:text-[#123B3A] shadow-xs border border-[#DCE4DF]",
            className
          )}
        >
          <Bookmark
            className={cn("w-4 h-4 transition-transform", saved && "fill-current scale-110")}
          />
        </button>

        {/* Transient feedback badge */}
        {justToggled && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-full mb-1.5 start-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-md z-30 transition-all pointer-events-none animate-in fade-in zoom-in-95",
              justToggled === "saved"
                ? "bg-[#216E4E] text-white"
                : "bg-[#182624] text-white"
            )}
          >
            {justToggled === "saved" ? "ރައްކާކުރެވިއްޖެ" : "އުނިކުރެވިއްޖެ"}
          </span>
        )}
      </div>
    );
  }

  // Variant: Icon only
  if (variant === "icon") {
    return (
      <div className="relative inline-flex items-center">
        {srAnnouncement}
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={saved}
          aria-label={ariaLabel}
          title={labelText}
          suppressHydrationWarning
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] touch-manipulation",
            saved
              ? "bg-[#123B3A] text-white shadow-xs"
              : "text-[#53635F] hover:text-[#182624] hover:bg-[#EDF2EF]",
            className
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
        </button>

        {justToggled && (
          <span
            aria-hidden="true"
            className="absolute -top-7 start-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#123B3A] text-white shadow-md z-30 pointer-events-none animate-in fade-in"
          >
            {justToggled === "saved" ? "ރައްކާކުރެވިއްޖެ" : "އުނިކުރެވިއްޖެ"}
          </span>
        )}
      </div>
    );
  }

  // Variant: Standard Button with text
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={ariaLabel}
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
          saved
            ? "bg-[#123B3A] text-white shadow-xs"
            : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF] hover:text-[#0F766E]",
          className
        )}
      >
        <Bookmark className={cn("w-3.5 h-3.5", saved ? "fill-white" : "text-[#53635F]")} />
        <span>{labelText}</span>
      </button>

      {/* Screen reader live announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        {justToggled === "saved"
          ? "ޚަބަރު ރައްކާކުރެވިއްޖެ"
          : justToggled === "removed"
          ? "ރައްކާކުރި ލިސްޓުން އުނިކުރެވިއްޖެ"
          : ""}
      </span>

      {justToggled && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-8 start-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold px-2.5 py-1 rounded-[6px] shadow-md z-30 pointer-events-none flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1",
            justToggled === "saved"
              ? "bg-[#216E4E] text-white"
              : "bg-[#182624] text-white"
          )}
        >
          <Check className="w-3 h-3 text-white" />
          <span>{justToggled === "saved" ? "ރައްކާކުރެވިއްޖެ!" : "އުނިކުރެވިއްޖެ"}</span>
        </span>
      )}
    </div>
  );
}
