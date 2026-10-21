"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  aspectRatio?: "16/9" | "4/3" | "16/10" | "3/2" | "auto";
  priority?: boolean;
  className?: string;
}

import { isSafeMediaUrl } from "@/lib/input-validation";

export function EditorialImage({
  src,
  alt,
  caption,
  credit,
  aspectRatio = "16/9",
  priority = false,
  className,
}: EditorialImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const isSafe = React.useMemo(() => isSafeMediaUrl(src), [src]);

  const aspectClass = {
    "16/9": "aspect-16/9",
    "4/3": "aspect-4/3",
    "16/10": "aspect-16/10",
    "3/2": "aspect-3/2",
    auto: "aspect-auto",
  }[aspectRatio];

  return (
    <figure className={cn("my-6 sm:my-8", className)}>
      <div
        className={cn(
          "relative w-full rounded-[10px] overflow-hidden bg-[#EDF2EF] border border-[#DCE4DF]",
          aspectClass
        )}
      >
        {hasError || !isSafe ? (
          <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center text-[#53635F]">
            <ImageIcon className="w-8 h-8 text-[#AAB9B2] mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold">{alt || "ފޮޓޯ ފެންނާކަށް ނެތް"}</p>
            <span className="text-[11px] text-[#AAB9B2] mt-1">މީޑިއާ ލޯޑުނުކުރެވުނު</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            loading={priority ? undefined : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {(caption || credit) && (
        <figcaption className="text-xs text-[#53635F] mt-2 px-1 leading-relaxed text-right">
          {caption && <span>{caption}</span>}
          {credit && (
            <span className="text-[#687671] mr-1.5 font-medium inline-block">
              (ފޮޓޯ: {credit})
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
