import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--ink)] select-none"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ms-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute start-3 flex items-center pointer-events-none text-[var(--ink-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none disabled:bg-[var(--surface-subtle)] disabled:opacity-60 disabled:cursor-not-allowed",
              leftIcon && "ps-9",
              rightIcon && "pe-9",
              error && "border-[var(--danger)] focus:border-[var(--danger)]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute end-3 flex items-center pointer-events-none text-[var(--ink-muted)]">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-[var(--ink)] select-none"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ms-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full min-h-[90px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none disabled:bg-[var(--surface-subtle)] disabled:opacity-60 disabled:cursor-not-allowed resize-y",
            error && "border-[var(--danger)] focus:border-[var(--danger)]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[var(--danger)] leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--ink-muted)] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

