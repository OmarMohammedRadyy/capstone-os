import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-subtle)] text-[var(--ink)] border border-[var(--border)]",
        secondary:
          "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] border border-[var(--border)]",
        accent:
          "bg-[var(--primary-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 font-semibold",
        gold:
          "bg-[var(--gold-subtle)] text-[var(--gold-text)] border border-[var(--gold-border)] font-semibold",
        copper:
          "bg-[var(--copper-subtle)] text-[var(--copper-text)] border border-[var(--copper)]/25 font-semibold",
        success:
          "bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/20 font-semibold",
        warning:
          "bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/25 font-semibold",
        danger:
          "bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger)]/20 font-semibold",
        destructive:
          "bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger)]/20 font-semibold",
        info:
          "bg-[var(--info-subtle)] text-[var(--info)] border border-[var(--info)]/20 font-semibold",
        outline:
          "border border-[var(--border)] text-[var(--ink-secondary)] bg-transparent",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] gap-1",
        md: "text-xs px-2.5 py-1 rounded-[var(--radius-sm)] gap-1.5",
        lg: "text-sm px-3 py-1.5 rounded-[var(--radius-md)] gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" && "bg-[var(--success)]",
            variant === "warning" && "bg-[var(--warning)]",
            (variant === "danger" || variant === "destructive") && "bg-[var(--danger)]",
            variant === "info" && "bg-[var(--info)]",
            variant === "accent" && "bg-[var(--accent)]",
            variant === "gold" && "bg-[var(--gold)]",
            variant === "copper" && "bg-[var(--copper)]",
            (!variant || variant === "default" || variant === "outline" || variant === "secondary") &&
              "bg-[var(--ink-secondary)]"
          )}
        />
      )}
      {children}
    </span>
  );
}
