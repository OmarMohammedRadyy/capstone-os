import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] shadow-xs border border-transparent",
        gold:
          "bg-[var(--gold-subtle)] text-[var(--gold-text)] border border-[var(--gold-border)] hover:bg-[var(--gold)]/20 font-semibold",
        secondary:
          "bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] shadow-xs",
        subtle:
          "bg-[var(--surface-subtle)] text-[var(--ink)] hover:bg-[var(--surface-hover)]",
        ghost:
          "bg-transparent text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
        danger:
          "bg-[var(--danger)] text-white hover:opacity-90 shadow-xs",
        destructive:
          "bg-[var(--danger)] text-white hover:opacity-90 shadow-xs",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--ink)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border-strong)]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-[var(--radius-sm)]",
        sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        md: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
        lg: "h-10 px-5 text-sm rounded-[var(--radius-md)]",
        icon: "h-9 w-9 rounded-[var(--radius-sm)] p-0",
        "icon-sm": "h-8 w-8 rounded-[var(--radius-sm)] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const busy = loading || isLoading;
    return (
      <button
        ref={ref}
        disabled={disabled || busy}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        {children}
        {!busy && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export { buttonVariants };
