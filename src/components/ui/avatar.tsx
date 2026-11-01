import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  // Deterministic institutional palette harmonized with Forest Green, Gold, and Copper
  const colors = [
    "bg-[#EFF8F2] text-[#163A24] border-[#163A24]/20 dark:bg-[#163A24]/40 dark:text-[#83D4A3] dark:border-[#34A866]/30",
    "bg-[#FBF7EB] text-[#8A6514] border-[#C89B2C]/30 dark:bg-[#4E3A0B]/40 dark:text-[#F0CA67] dark:border-[#DFB244]/30",
    "bg-[#FAF1EC] text-[#8F4D28] border-[#B4653A]/25 dark:bg-[#8F4D28]/30 dark:text-[#E59A72] dark:border-[#D48256]/30",
    "bg-[#F2F0EA] text-[#111814] border-[#C7C4B8] dark:bg-[#17221C] dark:text-[#ECEFE9] dark:border-[#314539]",
    "bg-[#DCF2E4] text-[#12301E] border-[#276741]/25 dark:bg-[#12301E]/60 dark:text-[#52BF80] dark:border-[#276741]/40",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = colors[Math.abs(hash) % colors.length];

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-full select-none shrink-0 border",
        sizeClasses[size],
        colorClass,
        className
      )}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
