"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20">
      <div className="max-w-lg mx-auto">
        <ErrorState onRetry={reset} />
      </div>
    </div>
  );
}
