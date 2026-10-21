"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutAction();
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="އެޑިޓޯރިއަލް ސެޝަނުން ސައިން އައުޓްވެވަޑައިގަންނަވާ"
      title="ސައިން އައުޓް"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[36px] cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5 text-[#D94343]" aria-hidden="true" />
      <span>{isLoading ? "ވަކިވަނީ..." : "ސައިން އައުޓް"}</span>
    </button>
  );
}
