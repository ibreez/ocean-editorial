"use client";

import * as React from "react";
import {
  X,
  Copy,
  Check,
  Send,
  MessageCircle,
  Share2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  summary?: string;
  url?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  slug,
  summary,
  url,
}: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Compute canonical absolute URL
  const articleUrl = React.useMemo(() => {
    if (url) return url;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/article/${slug}`;
    }
    return `/article/${slug}`;
  }, [url, slug]);

  const encodedUrl = encodeURIComponent(articleUrl);
  const shareText = `${title} — ކަނޑު އެޑިޓޯރިއަލް`;
  const encodedText = encodeURIComponent(shareText);
  const fullMessage = encodeURIComponent(`${title}\n\n${articleUrl}`);

  // Channel share targets (Viber, WhatsApp, Telegram, Facebook, X)
  const channels = [
    {
      id: "viber",
      name: "ވައިބަރ (Viber)",
      color: "bg-[#7360F2] text-white hover:bg-[#604CE2]",
      href: `viber://forward?text=${fullMessage}`,
      icon: (
        <span className="font-bold text-sm leading-none tracking-tight">V</span>
      ),
      note: "ރާއްޖޭގައި އެންމެ މަޤްބޫލު މެސެޖިންގ އެޕް",
    },
    {
      id: "whatsapp",
      name: "ވަޓްސްއެޕް (WhatsApp)",
      color: "bg-[#25D366] text-white hover:bg-[#20BD5A]",
      href: `https://api.whatsapp.com/send?text=${fullMessage}`,
      icon: <MessageCircle className="w-4 h-4" />,
      note: "ގްރޫޕް އަދި ޕްރައިވެޓް ޗެޓް",
    },
    {
      id: "telegram",
      name: "ޓެލެގްރާމް (Telegram)",
      color: "bg-[#229ED9] text-white hover:bg-[#1E8BC0]",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: <Send className="w-4 h-4" />,
      note: "ޗެނަލްތަކަށް ޙިއްޞާކުރެއްވުމަށް",
    },
    {
      id: "facebook",
      name: "ފޭސްބުކް (Facebook)",
      color: "bg-[#1877F2] text-white hover:bg-[#1565CC]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <span className="font-bold text-sm leading-none font-sans">f</span>
      ),
      note: "ފޭސްބުކް ޓައިމްލައިން ނުވަތަ ޕޭޖަށް",
    },
    {
      id: "x",
      name: "އެކްސް (X / Twitter)",
      color: "bg-[#000000] text-white hover:bg-[#222222]",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: (
        <span className="font-bold text-xs leading-none font-sans">𝕏</span>
      ),
      note: "ޓްވީޓް ކުރެއްވުމަށް",
    },
  ];

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(articleUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback
    }
  };

  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus management: Trap focus inside modal & restore focus on close
  React.useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus close button on open
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key & Tab trapping
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#FFFFFF] rounded-[14px] shadow-2xl border border-[#DCE4DF] overflow-hidden p-5 sm:p-6 text-right animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DF] mb-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="މޯޑަލް ލައްޕާ (Close dialog)"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-[#53635F] hover:text-[#182624] hover:bg-[#EDF2EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h2
              id="share-modal-title"
              className="text-lg font-bold text-[#123B3A]"
            >
              ޚަބަރު ޙިއްޞާކުރައްވާ
            </h2>
            <Share2 className="w-5 h-5 text-[#0F766E]" aria-hidden="true" />
          </div>
        </div>

        {/* Article Preview Card in Modal */}
        <div className="p-3 bg-[#F7F7F2] rounded-[8px] border border-[#DCE4DF] mb-5">
          <p className="text-xs text-[#0F766E] font-bold mb-1">
            ކަނޑު އެޑިޓޯރިއަލް
          </p>
          <h3 className="text-sm font-bold text-[#182624] leading-snug line-clamp-2">
            {title}
          </h3>
          {summary && (
            <p className="text-xs text-[#53635F] mt-1 line-clamp-1">
              {summary}
            </p>
          )}
        </div>

        {/* Copy Link Section */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-[#182624] mb-1.5">
            ޚަބަރުގެ ސީދާ ލިންކު:
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-[#EDF2EF] border border-[#DCE4DF] rounded-[8px]">
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                copied
                  ? "bg-[#216E4E] text-white"
                  : "bg-[#123B3A] text-white hover:bg-[#0F766E]"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>ކޮޕީކުރެވިއްޖެ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>ކޮޕީ</span>
                </>
              )}
            </button>
            <input
              type="text"
              readOnly
              value={articleUrl}
              dir="ltr"
              className="flex-1 bg-transparent text-xs text-[#182624] px-2 outline-none font-mono truncate select-all"
            />
          </div>
        </div>

        {/* Popular Maldivian Sharing Channels */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#687671] mb-2">
            ސޯޝަލް މީޑިއާ އަދި މެސެޖިންގ އެޕްތަކަށް:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {channels.map((ch) => (
              <a
                key={ch.id}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 min-h-[44px] rounded-[8px] border border-[#DCE4DF] hover:border-[#AAB9B2] bg-[#FFFFFF] hover:bg-[#F7F7F2] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#687671] group-hover:text-[#182624]">
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-[11px] hidden sm:inline">{ch.note}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#182624] group-hover:text-[#0F766E]">
                    {ch.name}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs",
                      ch.color
                    )}
                  >
                    {ch.icon}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Modal Footer Note */}
        <p className="text-[11px] text-[#687671] text-center mt-5 pt-3 border-t border-[#DCE4DF]">
          ތެދު މަޢުލޫމާތާއި ޞައްޙަ ޚަބަރު ފެތުރުމުގައި އެހީތެރިވެދެއްވާ
        </p>
      </div>
    </div>
  );
}
