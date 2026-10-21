import Link from "next/link";
import { Search } from "lucide-react";
import { SavedNavButton } from "./saved-nav-button";
import { siteConfig } from "@/lib/site-config";
import { getCurrentDhivehiDateFormatted } from "@/lib/format-date";
import { getBreakingArticle } from "@/lib/articles";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { BreakingNewsBanner } from "./breaking-news-banner";

export interface SiteHeaderProps {
  showBreakingNews?: boolean;
}

export function SiteHeader({ showBreakingNews = true }: SiteHeaderProps) {
  const currentDate = getCurrentDhivehiDateFormatted();
  const breakingStory = showBreakingNews ? getBreakingArticle() : null;

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#DCE4DF] sticky top-0 z-40 shadow-xs transition-shadow">
      {/* 1. Top Utility Strip */}
      <div className="bg-[#123B3A] text-white/90 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <time suppressHydrationWarning className="font-thaana">
              {currentDate}
            </time>
            <span className="text-white/40" aria-hidden="true">
              |
            </span>
            <span className="hidden sm:inline text-white/75">
              މާލެ، ދިވެހިރާއްޖެ
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/80">އެޑިޝަން: ދިވެހި</span>
            <span className="text-white/40" aria-hidden="true">
              |
            </span>
            <Link
              href="/about"
              className="hover:text-white transition-colors"
            >
              އިދާރާ
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Masthead */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <MobileNavigation />
        </div>

        {/* Brand Lockup: Clean, dignified Maldivian editorial typography */}
        <div className="flex-1 md:flex-initial text-center md:text-right">
          <Link href="/" className="inline-block group focus-visible:outline-none">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-noto-thaana text-[#123B3A] tracking-normal leading-none group-hover:text-[#0F766E] transition-colors">
              {siteConfig.dhivehiName}
            </h1>
            <p className="text-[11px] sm:text-xs font-latin tracking-widest uppercase text-[#53635F] mt-1 font-semibold">
              {siteConfig.name} · Digital Newsroom
            </p>
          </Link>
        </div>

        {/* Masthead Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            aria-label="ޚަބަރު ހޯދާ (Search)"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] text-[#182624] hover:bg-[#EDF2EF] hover:text-[#0F766E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <Search className="w-5 h-5" />
          </Link>

          <SavedNavButton />

          <div className="hidden md:flex border-r border-[#DCE4DF] pr-3 mr-1">
            <Link
              href="/about#subscribe"
              className="h-10 px-4 flex items-center justify-center rounded-[8px] text-xs font-bold bg-[#EDF2EF] text-[#123B3A] hover:bg-[#DCE4DF] transition-colors border border-[#DCE4DF]"
            >
              ނިއުސްލެޓަރ
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Bar (Desktop) */}
      <div className="border-t border-[#DCE4DF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <DesktopNavigation />
        </div>
      </div>

      {/* 4. Breaking News Banner (Loaded dynamically from editorial data) */}
      {breakingStory && <BreakingNewsBanner article={breakingStory} />}
    </header>
  );
}
