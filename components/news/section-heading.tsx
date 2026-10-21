import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  title: string;
  englishTitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

export function SectionHeading({
  title,
  englishTitle,
  viewAllHref,
  viewAllLabel = "އިތުރަށް ބައްލަވާ",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b-2 border-[#123B3A] pb-2.5 mb-6",
        className
      )}
    >
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-[#123B3A] tracking-tight">
          {title}
        </h2>
        {englishTitle && (
          <span className="text-[11px] font-latin font-bold tracking-wider uppercase text-[#53635F]">
            {englishTitle}
          </span>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] hover:text-[#123B3A] transition-colors group shrink-0"
        >
          <span>{viewAllLabel}</span>
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform rtl:rotate-0" />
        </Link>
      )}
    </div>
  );
}
