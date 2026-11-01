import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]",
        className
      )}
    >
      <div className="space-y-1 text-start min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-secondary)] mb-1"
          >
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronLeft className="h-3 w-3 text-[var(--ink-muted)] ltr:rotate-180 shrink-0" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-[var(--ink)] transition-colors truncate max-w-[160px]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[var(--ink)] font-semibold truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] leading-tight">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-xs text-[var(--ink-secondary)] max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

