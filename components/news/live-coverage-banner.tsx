import Link from "next/link";
import { ChevronLeft, Clock, Sparkles } from "lucide-react";
import type { LiveCoverage } from "@/types/article";
import { formatDhivehiDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export interface LiveCoverageBannerProps {
  coverage: LiveCoverage;
  className?: string;
}

export function LiveCoverageBanner({
  coverage,
  className,
}: LiveCoverageBannerProps) {
  const isLive = coverage.status === "live";
  const latestUpdate = coverage.updates[0];

  return (
    <aside
      aria-label="ވަގުތުން ގެނެސްދޭ ކަވަރޭޖް"
      className={cn(
        "relative overflow-hidden rounded-[12px] bg-gradient-to-l from-[#123B3A] to-[#0A2625] text-white p-4 sm:p-5 shadow-sm border border-[#0F766E]/40",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left/Start info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D94343] text-white text-[11px] font-bold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span>ވަގުތުން / LIVE</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
                ކަވަރޭޖް
              </span>
            )}

            <span className="text-xs text-[#0F766E] font-bold bg-white px-2 py-0.5 rounded-[4px]">
              {coverage.categoryName}
            </span>

            <span className="text-[11px] text-white/70 flex items-center gap-1 font-mono" suppressHydrationWarning>
              <Clock className="w-3 h-3 text-white/60" />
              <span>{formatDhivehiDateTime(coverage.updatedAt)}</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white hover:text-[#5EEAD4] transition-colors leading-snug line-clamp-1 mb-1">
            <Link href={`/live/${coverage.slug}`} className="focus-visible:outline-none focus-visible:underline">
              {coverage.title}
            </Link>
          </h3>

          {latestUpdate && (
            <p className="text-xs text-white/75 line-clamp-1 flex items-center gap-1.5">
              <span className="text-[#5EEAD4] font-semibold">އެންމެ ފަހުން:</span>
              <span>{latestUpdate.title}</span>
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="shrink-0 flex items-center justify-end">
          <Link
            href={`/live/${coverage.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#0F766E] hover:bg-[#139288] text-white text-xs font-bold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>ކަވަރޭޖް ބައްލަވާ</span>
            <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
