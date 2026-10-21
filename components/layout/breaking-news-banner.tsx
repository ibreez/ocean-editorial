"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ChevronLeft, X } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDhivehiRelativeTime } from "@/lib/format-date";

export interface BreakingNewsBannerProps {
  article?: Article | null;
  variant?: "urgent" | "developing" | "standard";
}

export function BreakingNewsBanner({
  article,
  variant = "urgent",
}: BreakingNewsBannerProps) {
  const [localDismissed, setLocalDismissed] = React.useState(false);

  const subscribe = React.useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = React.useCallback(() => {
    if (!article) return true;
    try {
      return sessionStorage.getItem("dismissed_breaking_id") === article.id;
    } catch {
      return false;
    }
  }, [article]);

  const getServerSnapshot = React.useCallback(() => false, []);

  const storedDismissed = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const isDismissed = localDismissed || storedDismissed;

  if (!article || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setLocalDismissed(true);
    if (article) {
      try {
        sessionStorage.setItem("dismissed_breaking_id", article.id);
        window.dispatchEvent(new Event("storage"));
      } catch {
        // Ignore
      }
    }
  };

  const isUrgent = variant === "urgent";

  return (
    <aside
      aria-label="ކުއްލި ޚަބަރު"
      className="w-full bg-[#D94343] text-white border-b border-[#B92F35] relative z-30 transition-all"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* News Content Link */}
        <div className="flex-1 flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          {/* Status Label */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-white text-[#D94343] font-black text-xs shrink-0 select-none">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isUrgent ? "ކުއްލި ޚަބަރު" : "މުހިންމު ޚަބަރު"}</span>
          </span>

          {/* Headline and Link */}
          <Link
            href={`/article/${article.slug}`}
            className="text-xs sm:text-sm font-bold text-white hover:text-white/90 underline decoration-white/40 hover:decoration-white transition-colors truncate max-w-2xl text-wrap"
          >
            {article.title}
          </Link>

          {/* Timestamp */}
          {article.publishedAt && (
            <span className="hidden md:inline-flex text-[11px] text-white/80 tabular-nums shrink-0">
              ({formatDhivehiRelativeTime(article.publishedAt)})
            </span>
          )}
        </div>

        {/* Read More & Dismiss Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/article/${article.slug}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white px-2 py-1 rounded-[4px] hover:bg-black/10 transition-colors"
          >
            <span>އިތުރަށް ކިޔާ</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="ކުއްލި ޚަބަރުގެ ބެނަރ ލައްޕާ"
            className="w-7 h-7 flex items-center justify-center rounded-[4px] text-white/80 hover:text-white hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
