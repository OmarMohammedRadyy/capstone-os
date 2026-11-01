"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HealthRingProps {
  score: number;
  status: "EXCELLENT" | "ON_TRACK" | "NEEDS_ATTENTION" | "AT_RISK" | "CRITICAL";
  size?: number;
  strokeWidth?: number;
  className?: string;
  showScore?: boolean;
}

export function HealthRing({
  score,
  status,
  size = 80,
  strokeWidth = 7,
  className,
  showScore = true,
}: HealthRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clampedScore / 100) * circumference;

  const colorMap = {
    EXCELLENT: "text-[var(--gold)]",
    ON_TRACK: "text-[var(--accent)]",
    NEEDS_ATTENTION: "text-[var(--warning)]",
    AT_RISK: "text-[var(--copper)]",
    CRITICAL: "text-[var(--danger)]",
  };

  const ringColor = colorMap[status] || "text-[var(--accent)]";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Project health score: ${clampedScore} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-[var(--surface-hover)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 ease-out", ringColor)}
        />
      </svg>
      {showScore && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-[var(--ink)] num-tabular">
            {clampedScore}
          </span>
          <span className="text-[10px] text-[var(--ink-secondary)] font-medium -mt-1">
            /100
          </span>
        </div>
      )}
    </div>
  );
}
