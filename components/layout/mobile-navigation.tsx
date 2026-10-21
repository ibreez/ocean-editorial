"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Home, Clock, ChevronLeft } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { SavedNavButton } from "./saved-nav-button";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement>(null);
  const wasOpenRef = React.useRef(false);

  // Focus close button on open, and restore focus to trigger button on close
  React.useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key, tab trapping & scroll locking
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab" && isOpen && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
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

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
        aria-label={isOpen ? "މެނޫ ލައްޕާ" : "މެނޫ ހުޅުވާ"}
        className="flex items-center justify-center w-11 h-11 rounded-[8px] text-[#182624] hover:bg-[#EDF2EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content (aligned to RTL start: right edge) */}
          <div
            id="mobile-menu-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="މޮބައިލް ނެވިގޭޝަން މެނޫ"
            className="relative mr-0 ml-auto w-4/5 max-w-xs h-full bg-[#FFFFFF] shadow-2xl z-50 flex flex-col p-6 overflow-y-auto border-l border-[#DCE4DF]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4DF] mb-4">
              <div>
                <span className="text-xl font-bold font-noto-thaana text-[#123B3A] block">
                  {siteConfig.dhivehiName}
                </span>
                <span className="text-xs text-[#53635F]">
                  {siteConfig.dhivehiTagline}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="މެނޫ ލައްޕާ"
                className="w-10 h-10 flex items-center justify-center rounded-[8px] hover:bg-[#EDF2EF] text-[#53635F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick shortcuts */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#EDF2EF] text-[#182624] text-xs font-semibold hover:bg-[#DCE4DF] transition-colors"
              >
                <Search className="w-4 h-4 text-[#0F766E]" />
                <span>ޚަބަރު ހޯދާ</span>
              </Link>
              <SavedNavButton
                variant="drawer-item"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Nav links */}
            <div className="space-y-1 flex-1">
              <p className="text-xs font-bold text-[#687671] px-2 py-1 mb-1">
                ޚަބަރުގެ ބައިތައް
              </p>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-[8px] text-sm font-bold transition-colors min-h-[44px]",
                  pathname === "/"
                    ? "bg-[#123B3A] text-white"
                    : "text-[#182624] hover:bg-[#EDF2EF]"
                )}
              >
                <Home className="w-4 h-4" />
                <span>ފުރަތަމަ ޞަފްޙާ</span>
              </Link>
              <Link
                href="/latest"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-[8px] text-sm font-bold transition-colors min-h-[44px]",
                  pathname === "/latest"
                    ? "bg-[#123B3A] text-white"
                    : "text-[#182624] hover:bg-[#EDF2EF]"
                )}
              >
                <Clock className="w-4 h-4" />
                <span>ފަހުގެ ޚަބަރު</span>
              </Link>
              {siteConfig.primaryNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-[8px] text-sm font-semibold transition-colors min-h-[44px]",
                      isActive
                        ? "bg-[#123B3A] text-white"
                        : "text-[#182624] hover:bg-[#EDF2EF]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60 font-latin text-left flex items-center gap-1">
                      {item.englishLabel}
                      <ChevronLeft className="w-3 h-3 opacity-40 rtl:rotate-0" />
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Utility links */}
            <div className="pt-4 border-t border-[#DCE4DF] mt-6 space-y-2 text-xs text-[#53635F]">
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="block py-1.5 hover:text-[#123B3A] transition-colors"
              >
                ތަޢާރަފާއި އެޑިޓޯރިއަލް ސިޔާސަތު
              </Link>
              <Link
                href="/privacy"
                onClick={() => setIsOpen(false)}
                className="block py-1.5 hover:text-[#123B3A] transition-colors"
              >
                ޕްރައިވެސީ ސިޔާސަތު
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
