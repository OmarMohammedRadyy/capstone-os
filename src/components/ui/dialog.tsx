"use client";

import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

export function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  hideCloseButton?: boolean;
}

export function DialogContent({
  className,
  children,
  hideCloseButton = false,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[var(--border)] bg-[var(--surface)] p-6 shadow-modal duration-200 rounded-[var(--radius-lg)]",
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <RadixDialog.Close className="absolute end-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--ink-secondary)] opacity-70 transition-opacity hover:opacity-100 hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </RadixDialog.Close>
        )}
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-start", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn("text-base font-semibold leading-none tracking-tight text-[var(--ink)]", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn("text-xs text-[var(--ink-secondary)] leading-normal mt-1", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-x-reverse gap-2 pt-4 border-t border-[var(--border-subtle)]", className)}
      {...props}
    />
  );
}

