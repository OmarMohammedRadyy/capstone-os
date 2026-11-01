import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-subtle)]/40 my-4",
        className
      )}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[var(--surface-hover)] text-[var(--ink-secondary)] mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-[var(--ink)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--ink-secondary)] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

