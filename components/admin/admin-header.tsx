import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  ExternalLink,
  Users,
  LogIn,
} from "lucide-react";
import type { EditorialUser } from "@/types/cms";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/lib/utils";

export interface AdminHeaderProps {
  currentUser?: EditorialUser | null;
}

const ROLE_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  admin: {
    label: "އެޑްމިނިސްޓްރޭޓަރ",
    badgeClass: "bg-[#0F766E] text-white",
  },
  editor: {
    label: "އެޑިޓަރ",
    badgeClass: "bg-[#155E9A] text-white",
  },
  journalist: {
    label: "ނޫސްވެރިޔާ",
    badgeClass: "bg-[#53635F] text-white",
  },
};

export function AdminHeader({ currentUser }: AdminHeaderProps) {
  const roleConfig = currentUser ? ROLE_DISPLAY[currentUser.role] : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#123B3A] text-white border-b border-[#0F766E]/40 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Area Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-[6px] px-1 py-0.5"
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#0F766E] flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              OE
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base font-thaana block">
                ކަނޑު އެޑިޓޯރިއަލް <span className="text-xs text-white/70 font-sans font-normal">CMS</span>
              </span>
              <span className="text-[11px] text-white/60 font-sans tracking-wide">
                Editorial Newsroom CMS
              </span>
            </div>
          </Link>

          {/* Current User Role Badge */}
          {currentUser && roleConfig && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <span className="font-thaana text-[#AAB9B2] text-[11px]">
                {currentUser.dhivehiName || currentUser.name}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-[4px] text-[10px] font-bold",
                  roleConfig.badgeClass
                )}
              >
                {roleConfig.label}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="އެޑްމިން ނެވިގޭޝަން" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[40px]"
          >
            <LayoutDashboard className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
            <span>ޑޭޝްބޯޑް</span>
          </Link>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors text-xs sm:text-sm font-bold shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4 text-white" aria-hidden="true" />
            <span>އައު ޚަބަރެއް</span>
          </Link>

          {/* Admin User Management Link (Admin only) */}
          {currentUser?.role === "admin" && (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[40px]"
            >
              <Users className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
              <span>ޔޫޒަރުން</span>
            </Link>
          )}

          <div className="h-6 w-px bg-white/20 hidden sm:block" aria-hidden="true" />

          {/* User Session Action (Sign Out or Sign In) */}
          {currentUser ? (
            <SignOutButton />
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[36px]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
              <span>ލޮގިން</span>
            </Link>
          )}

          {/* Link back to public news portal */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-white/75 hover:text-white transition-colors px-2.5 py-2 rounded-[6px] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[40px]"
            title="ޢާންމު ނޫސް ވެބްސައިޓު ބައްލަވާ"
          >
            <span className="hidden sm:inline">ޢާންމު ސައިޓު</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/60" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
