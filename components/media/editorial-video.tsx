"use client";

import * as React from "react";
import { Video, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditorialVideoProps {
  src: string;
  title: string;
  caption?: string;
  credit?: string;
  poster?: string;
  className?: string;
}

import { getSafeVideoEmbed } from "@/lib/input-validation";

export function EditorialVideo({
  src,
  title,
  caption,
  credit,
  poster,
  className,
}: EditorialVideoProps) {
  const [hasError, setHasError] = React.useState(false);

  const safeVideo = React.useMemo(() => getSafeVideoEmbed(src), [src]);

  return (
    <figure className={cn("my-6 sm:my-8", className)}>
      <div className="relative aspect-16/9 w-full rounded-[10px] overflow-hidden bg-[#123B3A] border border-[#DCE4DF] shadow-xs">
        {hasError || (!safeVideo.isEmbed && !safeVideo.isSafeDirectVideo) ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/80">
            <AlertCircle className="w-8 h-8 text-[#D94343] mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold">{title}</p>
            <span className="text-[11px] text-white/60 mt-1">ވީޑިއޯ ޕްލޭކުރެވޭކަށް ނެތް (އުޞޫލާ ޚިލާފު ލިންކެއް)</span>
          </div>
        ) : safeVideo.isEmbed && safeVideo.safeEmbedUrl ? (
          <iframe
            src={safeVideo.safeEmbedUrl}
            title={title}
            onError={() => setHasError(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <video
            src={src}
            title={title}
            poster={poster}
            controls
            preload="metadata"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          >
            <track kind="captions" />
            {title}
          </video>
        )}

        {/* Video badge */}
        <div className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-[4px] bg-black/70 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs pointer-events-none">
          <Video className="w-3.5 h-3.5 text-[#D94343]" aria-hidden="true" />
          <span>ވީޑިއޯ</span>
        </div>
      </div>

      {(caption || credit) && (
        <figcaption className="text-xs text-[#53635F] mt-2 px-1 leading-relaxed text-right">
          {caption && <span>{caption}</span>}
          {credit && (
            <span className="text-[#687671] mr-1.5 font-medium inline-block">
              (މަޞްދަރު: {credit})
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
