"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  LayoutDashboard,
  CheckSquare,
  Compass,
  MessageSquareWarning,
  Calendar,
  FolderLock,
  Scale,
  AlertTriangle,
  BarChart3,
  PackageCheck,
  Presentation,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Briefcase,
  Tv,
  Zap,
  Flag,
  PlusCircle,
} from "lucide-react";

interface SidebarProps {
  projectSlug: string;
  projectTitle: string;
  projectCode: string;
  userRole?: string;
  openFeedbackCount?: number;
}

export function Sidebar({
  projectSlug,
  projectTitle,
  projectCode,
  userRole = "STUDENT",
  openFeedbackCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const baseUrl = `/app/p/${projectSlug}`;

  const navGroups = [
    {
      label: locale === "ar" ? "المتابعة اليومية" : "Daily Work",
      items: [
        {
          name: t.nav.overview,
          href: `${baseUrl}/overview`,
          icon: LayoutDashboard,
        },
        {
          name: t.nav.myWork,
          href: `${baseUrl}/my-work`,
          icon: Briefcase,
        },
      ],
    },
    {
      label: locale === "ar" ? "التخطيط والتنفيذ" : "Planning & Execution",
      items: [
        {
          name: t.nav.roadmap,
          href: `${baseUrl}/roadmap`,
          icon: Compass,
        },
        {
          name: t.nav.milestones,
          href: `${baseUrl}/milestones`,
          icon: Flag,
        },
        {
          name: t.nav.tasks,
          href: `${baseUrl}/tasks`,
          icon: CheckSquare,
        },
        {
          name: t.nav.sprints,
          href: `${baseUrl}/sprints`,
          icon: Zap,
        },
      ],
    },
    {
      label: locale === "ar" ? "الإشراف والاجتماعات" : "Supervision",
      items: [
        {
          name: t.nav.feedback,
          href: `${baseUrl}/feedback`,
          icon: MessageSquareWarning,
          badge: openFeedbackCount > 0 ? openFeedbackCount : undefined,
        },
        {
          name: t.nav.meetings,
          href: `${baseUrl}/meetings`,
          icon: Calendar,
        },
        {
          name: t.nav.decisions,
          href: `${baseUrl}/decisions`,
          icon: Scale,
        },
      ],
    },
    {
      label: locale === "ar" ? "الملفات والتسليمات" : "Deliverables",
      items: [
        {
          name: t.nav.documents,
          href: `${baseUrl}/documents`,
          icon: FolderLock,
        },
        {
          name: t.nav.risks,
          href: `${baseUrl}/risks`,
          icon: AlertTriangle,
        },
        {
          name: t.nav.submissions,
          href: `${baseUrl}/submissions`,
          icon: PackageCheck,
        },
        {
          name: t.nav.activity,
          href: `${baseUrl}/activity`,
          icon: Activity,
        },
      ],
    },
    {
      label: locale === "ar" ? "التقارير والأداء" : "Analytics",
      items: [
        {
          name: t.nav.analytics,
          href: `${baseUrl}/analytics`,
          icon: BarChart3,
        },
      ],
    },
    {
      label: locale === "ar" ? "المناقشة النهائية" : "Final Defense",
      items: [
        {
          name: t.nav.defense,
          href: `${baseUrl}/defense`,
          icon: Presentation,
        },
        {
          name: locale === "ar" ? "شاشة العرض (Presentation)" : "Presentation Mode",
          href: `${baseUrl}/defense/present`,
          icon: Tv,
        },
      ],
    },
    {
      label: locale === "ar" ? "إعدادات المشروع" : "Settings",
      items: [
        {
          name: t.nav.settings,
          href: `${baseUrl}/settings`,
          icon: Settings,
        },
      ],
    },
  ];

  const allProjectsLabel =
    locale === "ar" ? "جميع مشاريع التخرج" : "All Graduation Projects";

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-e border-[var(--border)] bg-[var(--surface)] transition-all duration-150 select-none shrink-0 z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand & Project Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo size="sm" />
            <div className="min-w-0 flex-1 text-start">
              <div className="flex items-center gap-1.5">
                <span
                  dir="ltr"
                  className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]"
                >
                  <span>SVA</span>
                  <span className="text-[var(--gold)] mx-0.5">—</span>
                  <span className="text-[var(--gold-text)] dark:text-[#DBC477]">DUATE</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[var(--gold-subtle)] text-[var(--gold-text)] border border-[var(--gold-border)] rounded">
                  {projectCode}
                </span>
              </div>
              <h2
                className="text-xs font-bold text-[var(--ink)] truncate mt-0.5"
                title={projectTitle}
              >
                {projectTitle}
              </h2>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <BrandLogo size="sm" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors cursor-pointer shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
          ) : (
            <ChevronRight className="h-4 w-4 ltr:rotate-180" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] text-start">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== `${baseUrl}/defense` && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group relative flex items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-[var(--primary-subtle)] text-[var(--accent)] font-semibold"
                      : "text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-y-1.5 start-0 w-1 rounded-e-full bg-[var(--accent)]" />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink-secondary)] group-hover:text-[var(--ink)]"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger)]/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Switch Project Link */}
      <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface-subtle)]/40 space-y-1">
        <Link
          href="/app/projects"
          className={cn(
            "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors",
            collapsed && "justify-center"
          )}
          title={allProjectsLabel}
        >
          <FolderKanban className="h-4 w-4 shrink-0 text-[var(--gold)]" />
          {!collapsed && <span className="truncate">{allProjectsLabel}</span>}
        </Link>
        <Link
          href="/app/projects/new"
          className={cn(
            "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors",
            collapsed && "justify-center"
          )}
          title={locale === "ar" ? "إنشاء مشروع تخرج جديد" : "Create New Project"}
        >
          <PlusCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          {!collapsed && (
            <span className="truncate">
              {locale === "ar" ? "إنشاء مشروع جديد" : "New Capstone Project"}
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
