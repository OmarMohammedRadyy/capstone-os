import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, id, disabled, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[var(--ink)] select-none"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ms-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 pe-8 text-sm text-[var(--ink)] transition-colors appearance-none focus:border-[var(--accent)] focus:outline-none disabled:bg-[var(--surface-subtle)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
              error && "border-[var(--danger)] focus:border-[var(--danger)]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute end-3 pointer-events-none text-[var(--ink-muted)]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-[var(--danger)] leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--ink-muted)] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

