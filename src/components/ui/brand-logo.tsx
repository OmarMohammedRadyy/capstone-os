import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * Official SVA-DUATE Brand Emblem (`/brand/logo.png`)
 * Features the official Deep Forest Leaf + Golden "SA" Fountain Pen Crest
 * framed in Warm Copper, housed in a refined institutional container.
 */
export function BrandLogo({
  size = "md",
  showText = false,
  subtitle,
  className,
}: BrandLogoProps) {
  const dimensions = {
    sm: { box: "h-8 w-8 p-1", px: 28 },
    md: { box: "h-10 w-10 p-1", px: 36 },
    lg: { box: "h-12 w-12 p-1.5", px: 44 },
  };

  const currentSize = dimensions[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-[var(--radius-md)] bg-[#FCFBF9] dark:bg-[#17221C] border border-[var(--gold-border)] shadow-xs shrink-0 overflow-hidden",
          currentSize.box
        )}
      >
        <Image
          src="/brand/logo.png"
          alt="SVA-DUATE Official Emblem"
          width={currentSize.px}
          height={currentSize.px}
          unoptimized
          className="w-full h-full object-contain drop-shadow-[0_1px_1px_rgba(10,31,19,0.18)]"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-1.5" dir="ltr">
            <span className="font-bold tracking-[0.14em] text-[var(--ink)] leading-none text-sm uppercase">
              <span>SVA</span>
              <span className="text-[var(--gold)] mx-0.5 font-normal">—</span>
              <span className="text-[var(--gold-text)] dark:text-[#DBC477]">DUATE</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded bg-[var(--gold-subtle)] text-[var(--gold-text)] border border-[var(--gold-border)]">
              SA EDITION
            </span>
          </div>
          {subtitle && (
            <span className="text-[11px] text-[var(--ink-secondary)] mt-0.5 truncate max-w-[230px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
