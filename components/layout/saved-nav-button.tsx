"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useSavedArticles } from "@/lib/saved-articles";
import { cn } from "@/lib/utils";

export interface SavedNavButtonProps {
  className?: string;
  variant?: "icon" | "drawer-item";
  onClick?: () => void;
}

export function SavedNavButton({
  className,
  variant = "icon",
  onClick,
}: SavedNavButtonProps) {
  const { count, isLoaded } = useSavedArticles();

  if (variant === "drawer-item") {
    return (
      <Link
        href="/saved"
        onClick={onClick}
        suppressHydrationWarning
        className={cn(
          "flex items-center justify-between p-2.5 rounded-[8px] bg-[#EDF2EF] text-[#182624] text-xs font-semibold hover:bg-[#DCE4DF] transition-colors",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#0F766E]" />
          <span>ރައްކާކުރި ޚަބަރު</span>
        </div>
        {isLoaded && count > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white font-mono leading-none">
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/saved"
      onClick={onClick}
      suppressHydrationWarning
      aria-label={`ރައްކާކުރި ޚަބަރުތައް (Saved Articles)${isLoaded && count > 0 ? ` - ${count} ޚަބަރު` : ""}`}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] text-[#182624] hover:bg-[#EDF2EF] hover:text-[#0F766E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
        className
      )}
    >
      <Bookmark className="w-5 h-5" />
      {isLoaded && count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 start-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center leading-none font-mono shadow-xs animate-in zoom-in-75 duration-200"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
