import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  subtle?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  subtle,
  interactive,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--ink)]",
        subtle && "bg-[var(--surface-subtle)] border-[var(--border-subtle)]",
        interactive &&
          "transition-all hover:border-[var(--ink-secondary)] hover:shadow-xs cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold leading-tight text-[var(--ink)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-[var(--ink-secondary)] leading-normal", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-4 border-t border-[var(--border-subtle)]", className)} {...props}>
      {children}
    </div>
  );
}

