"use client";

import { useState, useEffect } from "react";
import { padNumber } from "@/lib/utils";

interface ArchImageProps {
  src?: string | null;
  title: string;
  no: number;
  status: string;
  didirikan?: string;
  className?: string;
}

export default function ArchImage({
  src,
  title,
  no,
  status,
  didirikan,
  className = "",
}: ArchImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showImage = Boolean(src && !hasError);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a1610] via-[#12100c] to-[#0b0a08] ${className}`}
    >
      {showImage ? (
        <img
          src={src!}
          alt=""
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        /* Luxury Centered Architectural Cathedral Engraving Placeholder */
        <div className="flex flex-col items-center justify-center text-center px-6 pt-6 pb-4 select-none">
          {/* Radial golden halo behind cathedral icon */}
          <div className="relative flex items-center justify-center mb-2">
            <div className="absolute w-24 h-24 rounded-full bg-[#d4af37]/10 blur-xl" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-[#d4af37]/70 group-hover:text-[#f3e5ab] transition-colors duration-500"
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              {/* Outer Arch Dome */}
              <path d="M22 102V58c0-22 17-38 38-38s38 16 38 38v44" />
              {/* Inner Arch */}
              <path
                d="M36 102V64c0-14 11-25 24-25s24 11 24 25v38"
                strokeOpacity="0.5"
              />
              {/* Portal Door */}
              <path d="M46 102V76c0-8 6-14 14-14s14 6 14 14v26" />
              {/* Rose Window */}
              <circle cx="60" cy="48" r="6" strokeOpacity="0.7" />
              {/* Cross at Apex */}
              <path d="M60 20V8M53 13h14" strokeWidth="1.6" />
              {/* Base Steps */}
              <path d="M12 102h96M18 107h84" strokeOpacity="0.6" />
            </svg>
          </div>

          <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
            ARSIP #{padNumber(no)} · {status.toUpperCase()}
          </div>
          {didirikan && (
            <div className="text-[10px] font-mono text-[#8c8273] mt-0.5">
              {didirikan}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

