"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  LayoutDashboard,
  UserCheck,
  CheckSquare,
  Map,
  MoreHorizontal,
  X,
  Flag,
  Calendar,
  MessageSquare,
  FolderLock,
  Scale,
  AlertTriangle,
  BarChart3,
  Send,
  ShieldCheck,
  Activity,
  Settings,
  Zap,
  Tv,
} from "lucide-react";

interface MobileNavProps {
  projectSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ projectSlug, isOpen, onClose }: MobileNavProps) {
  const { t, isRtl } = useTranslation();
  const pathname = usePathname();
  const basePath = `/app/p/${projectSlug}`;

  const topItems = [
    { label: t.nav.overview, href: `${basePath}/overview`, icon: LayoutDashboard },
    { label: t.nav.myWork, href: `${basePath}/my-work`, icon: UserCheck },
    { label: t.nav.tasks, href: `${basePath}/tasks`, icon: CheckSquare },
    { label: t.nav.roadmap, href: `${basePath}/roadmap`, icon: Map },
  ];

  const moreItems = [
    { label: t.nav.milestones, href: `${basePath}/milestones`, icon: Flag },
    { label: t.nav.sprints, href: `${basePath}/sprints`, icon: Zap },
    { label: t.nav.meetings, href: `${basePath}/meetings`, icon: Calendar },
    { label: t.nav.feedback, href: `${basePath}/feedback`, icon: MessageSquare },
    { label: t.nav.documents, href: `${basePath}/documents`, icon: FolderLock },
    { label: t.nav.decisions, href: `${basePath}/decisions`, icon: Scale },
    { label: t.nav.risks, href: `${basePath}/risks`, icon: AlertTriangle },
    { label: t.nav.analytics, href: `${basePath}/analytics`, icon: BarChart3 },
    { label: t.nav.submissions, href: `${basePath}/submissions`, icon: Send },
    { label: t.nav.defense, href: `${basePath}/defense`, icon: ShieldCheck },
    { label: "شاشة العرض (Presentation)", href: `${basePath}/defense/present`, icon: Tv },
    { label: t.nav.activity, href: `${basePath}/activity`, icon: Activity },
    { label: t.nav.settings, href: `${basePath}/settings`, icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Mobile Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--surface)] border-t border-[var(--border)] z-40 flex items-center justify-around px-2 shadow-modal">
        {topItems.map((item) => {
          const isActive = pathname === item.href || (item.href.endsWith("/overview") && pathname === basePath);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors",
            isOpen ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-secondary)]"
          )}
        >
          <MoreHorizontal className="h-5 w-5 mb-0.5" />
          <span>المزيد</span>
        </button>
      </nav>

      {/* Full-screen Drawer for "More" Navigation on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end md:hidden">
          <div className="bg-[var(--surface)] border-t border-[var(--border)] rounded-t-[var(--radius-xl)] max-h-[80vh] flex flex-col p-4 shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="sm" showText />
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-[var(--radius-sm)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 py-4 overflow-y-auto">
              {moreItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-semibold"
                        : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

