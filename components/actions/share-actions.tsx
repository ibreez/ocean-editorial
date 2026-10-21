"use client";

import * as React from "react";
import { Share2, Link as LinkIcon, Check, Printer, MoreHorizontal } from "lucide-react";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { ShareModal } from "@/components/actions/share-modal";
import { cn } from "@/lib/utils";

export interface ShareActionsProps {
  title: string;
  url?: string;
  slug: string;
  summary?: string;
  className?: string;
  onTextSizeChange?: (size: "sm" | "base" | "lg") => void;
  currentTextSize?: "sm" | "base" | "lg";
}

export function ShareActions({
  title,
  url,
  slug,
  summary,
  className,
  onTextSizeChange,
  currentTextSize = "base",
}: ShareActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const getCanonicalUrl = React.useCallback(() => {
    if (url) return url;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/article/${slug}`;
    }
    return `/article/${slug}`;
  }, [url, slug]);

  const handleShareClick = async () => {
    const shareUrl = getCanonicalUrl();
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: summary || `${title} — ކަނޑު އެޑިޓޯރިއަލް`,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        // User aborted or unallowed; fall back to opening share modal
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    const shareUrl = getCanonicalUrl();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setIsShareModalOpen(true);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] text-xs print:hidden shadow-xs",
          className
        )}
      >
        {/* Share and Bookmark Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#182624] ml-1">ޙިއްޞާކުރައްވާ:</span>

          {/* Primary Share Action (Web Share API or Opens Modal) */}
          <button
            type="button"
            onClick={handleShareClick}
            aria-label="ޚަބަރު ޙިއްޞާކުރައްވާ"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF] hover:text-[#0F766E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>ޙިއްޞާ</span>
          </button>

          {/* Copy Direct Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="ލިންކު ކޮޕީކުރައްވާ"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
              copied
                ? "bg-[#216E4E] text-white"
                : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF]"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>ކޮޕީކުރެވިއްޖެ!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5 text-[#53635F]" />
                <span>ލިންކު</span>
              </>
            )}
          </button>

          {/* Open Channels Menu Button (Viber, WhatsApp, Telegram, etc.) */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            aria-label="އެހެން ވަސީލަތްތަކުން ޙިއްޞާކުރައްވާ (More share channels)"
            title="ވައިބަރ، ވަޓްސްއެޕް، ފޭސްބުކް"
            className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#EDF2EF] text-[#53635F] hover:bg-[#DCE4DF] hover:text-[#182624] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-[#DCE4DF] mx-1" aria-hidden="true" />

          {/* Bookmark Button */}
          <BookmarkButton
            slug={slug}
            title={title}
            variant="button"
          />
        </div>

        {/* Reading Controls: Text size & Print */}
        <div className="flex items-center gap-3">
          {onTextSizeChange && (
            <div className="flex items-center gap-1 bg-[#EDF2EF] p-0.5 rounded-[6px]">
              <span className="text-[11px] text-[#687671] px-1 font-medium select-none">
                ފޮންޓް:
              </span>
              <button
                type="button"
                onClick={() => onTextSizeChange("sm")}
                className={cn(
                  "px-2 py-0.5 rounded-[4px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F766E]",
                  currentTextSize === "sm"
                    ? "bg-white text-[#123B3A] shadow-xs"
                    : "text-[#53635F] hover:text-[#182624]"
                )}
                aria-label="ކުޑަ ފޮންޓް"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("base")}
                className={cn(
                  "px-2 py-0.5 rounded-[4px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F766E]",
                  currentTextSize === "base"
                    ? "bg-white text-[#123B3A] shadow-xs"
                    : "text-[#53635F] hover:text-[#182624]"
                )}
                aria-label="އާދައިގެ ފޮންޓް"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("lg")}
                className={cn(
                  "px-2 py-0.5 rounded-[4px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F766E]",
                  currentTextSize === "lg"
                    ? "bg-white text-[#123B3A] shadow-xs"
                    : "text-[#53635F] hover:text-[#182624]"
                )}
                aria-label="ބޮޑު ފޮންޓް"
              >
                A+
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            aria-label="ޚަބަރު ޕްރިންޓް ކުރައްވާ"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[#53635F] hover:text-[#182624] hover:bg-[#EDF2EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ޕްރިންޓް</span>
          </button>
        </div>
      </div>

      {/* Social Channels Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        slug={slug}
        summary={summary}
        url={url}
      />
    </>
  );
}
