"use client";

import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Contextual Side Detail Panel (Drawer)
 * Preserves spatial context on boards/tables while inspecting or editing an entity.
 * Automatically adapts to RTL (slides from inline-end) and LTR.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] transition-opacity" />
        <RadixDialog.Content
          className={cn(
            "fixed inset-y-0 end-0 z-50 w-full max-w-xl border-s border-[var(--border)] bg-[var(--surface)] shadow-modal flex flex-col justify-between focus:outline-none transition-transform duration-200",
            className
          )}
        >
          {/* Sticky Header */}
          <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4 bg-[var(--surface-elevated)]">
            <div className="space-y-1 text-start min-w-0 flex-1">
              {subtitle && <div className="flex items-center gap-2">{subtitle}</div>}
              <RadixDialog.Title className="text-base font-bold text-[var(--ink)] leading-snug">
                {title}
              </RadixDialog.Title>
            </div>

            <RadixDialog.Close
              className="rounded-[var(--radius-sm)] p-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </RadixDialog.Close>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 text-start space-y-5">
            {children}
          </div>

          {/* Optional Sticky Footer */}
          {footer && (
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-subtle)]/50 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

