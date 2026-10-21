"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="މައި ބައިތަކުގެ ނެވިގޭޝަން"
      className="hidden md:flex items-center gap-6 overflow-x-auto py-2.5"
    >
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2",
          pathname === "/"
            ? "border-[#123B3A] text-[#123B3A] font-bold"
            : "border-transparent text-[#53635F] hover:text-[#182624] hover:border-[#AAB9B2]"
        )}
      >
        ފުރަތަމަ ޞަފްޙާ
      </Link>
      <Link
        href="/latest"
        className={cn(
          "text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2",
          pathname === "/latest"
            ? "border-[#123B3A] text-[#123B3A] font-bold"
            : "border-transparent text-[#53635F] hover:text-[#182624] hover:border-[#AAB9B2]"
        )}
      >
        ފަހުގެ ޚަބަރު
      </Link>
      {siteConfig.primaryNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.slug}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2",
              isActive
                ? "border-[#123B3A] text-[#123B3A] font-bold"
                : "border-transparent text-[#53635F] hover:text-[#182624] hover:border-[#AAB9B2]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
