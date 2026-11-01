"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { logoutAction } from "@/app/actions/auth-actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Languages,
  LogOut,
  Plus,
  CheckSquare,
  Calendar,
  FolderLock,
  Scale,
  AlertTriangle,
  Compass,
  ChevronLeft,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { GlobalSearchDialog } from "./global-search-dialog";
import { useUserGuide } from "@/features/user-guide";

interface TopBarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  projectId: string;
  projectSlug: string;
  projectCode?: string;
  projectTitle?: string;
}

export function TopBar({
  user,
  projectId,
  projectSlug,
  projectCode = "SCOP-2026",
}: TopBarProps) {
  const { t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { openGuideCenter, startPageGuideForCurrentRoute } = useUserGuide();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: string;
      readAt: string | null;
      createdAt: string;
      linkUrl: string | null;
      params: Record<string, unknown>;
    }>
  >([]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl + K or "/" for Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      } else if (e.key === "/" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await fetch("/api/v1/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data?.items || []);
          setUnreadCount(data.data?.unreadCount || 0);
        }
      } catch {
        // Ignore network errors during background poll
      }
    }
    loadNotifs();
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.cookie = "capstone_theme=dark; path=/; max-age=31536000";
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "capstone_theme=light; path=/; max-age=31536000";
    }
  };

  const toggleLocale = () => {
    const next = locale === "ar" ? "en" : "ar";
    setLocale(next);
    router.refresh();
  };

  const markAllRead = async () => {
    await fetch("/api/v1/notifications/mark-all-read", { method: "POST" });
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  // Resolve current section breadcrumb label
  const baseUrl = `/app/p/${projectSlug}`;
  const sectionMap: Record<string, { ar: string; en: string }> = {
    overview: { ar: "لوحة المتابعة", en: "Overview" },
    "my-work": { ar: "مهامي", en: "My Work" },
    tasks: { ar: "إدارة المهام", en: "Tasks" },
    sprints: { ar: "السبرنتات (Sprints)", en: "Sprints" },
    roadmap: { ar: "خطة المشروع والمراحل", en: "Project Plan" },
    milestones: { ar: "التسليمات المرحلية", en: "Milestones" },
    feedback: { ar: "ملاحظات المشرف", en: "Supervisor Feedback" },
    meetings: { ar: "الاجتماعات والمحاضر", en: "Meetings" },
    documents: { ar: "المستندات والملفات", en: "Documents" },
    decisions: { ar: "القرارات التقنية", en: "Technical Decisions" },
    risks: { ar: "المخاطر والمشكلات", en: "Risks & Issues" },
    analytics: { ar: "تقارير الأداء", en: "Team Analytics" },
    submissions: { ar: "التسليمات النهائية", en: "Submissions" },
    defense: { ar: "التحضير للمناقشة", en: "Defense Preparation" },
    activity: { ar: "سجل النشاط", en: "Activity Log" },
    settings: { ar: "إعدادات المشروع", en: "Project Settings" },
  };

  const activeSegment = pathname.replace(`${baseUrl}/`, "").split("/")[0] || "overview";
  const currentBreadcrumb =
    sectionMap[activeSegment]?.[locale === "ar" ? "ar" : "en"] || activeSegment;

  const quickCreateLinks = [
    {
      label: locale === "ar" ? "مهمة جديدة (New Task)" : "New Task",
      href: `${baseUrl}/tasks`,
      icon: CheckSquare,
    },
    {
      label: locale === "ar" ? "جدولة اجتماع (Schedule Meeting)" : "Schedule Meeting",
      href: `${baseUrl}/meetings`,
      icon: Calendar,
    },
    {
      label: locale === "ar" ? "رفع مستند أو إصدار (Upload Document)" : "New Document",
      href: `${baseUrl}/documents`,
      icon: FolderLock,
    },
    {
      label: locale === "ar" ? "تسجيل قرار معماري (Record ADR)" : "Record Decision (ADR)",
      href: `${baseUrl}/decisions`,
      icon: Scale,
    },
    {
      label: locale === "ar" ? "تسجيل خطر أو مشكلة (Log Risk/Issue)" : "Log Risk or Issue",
      href: `${baseUrl}/risks`,
      icon: AlertTriangle,
    },
    {
      label: locale === "ar" ? "تحديث محطة رئيسية (Milestones)" : "Manage Milestones",
      href: `${baseUrl}/roadmap`,
      icon: Compass,
    },
  ];

  return (
    <>
      <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left / Start: Breadcrumb + Command Palette Trigger */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Dynamic Breadcrumb */}
          <nav
            aria-label="Workspace Breadcrumb"
            className="hidden md:flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] shrink-0"
          >
            <Link
              href={`${baseUrl}/overview`}
              className="font-mono font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
            >
              {projectCode}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-[var(--ink-muted)] ltr:rotate-180" />
            <span className="font-semibold text-[var(--ink)] truncate max-w-[180px]">
              {currentBreadcrumb}
            </span>
          </nav>

          {/* Command Palette / Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between w-full max-w-xs h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              <span className="truncate">{t.common.search}</span>
            </span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--ink-muted)]">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right / End: Quick Create + Controls & Profile */}
        <div className="flex items-center gap-2">
          {/* Interactive User Guide Center Button */}
          <button
            type="button"
            data-guide="topbar-guide-button"
            onClick={openGuideCenter}
            className="h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--gold-border)] bg-[var(--gold-subtle)] text-[var(--gold-text)] hover:bg-[var(--gold)]/20 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            title={locale === "ar" ? "افتح دليل النظام والجولات التعليمية" : "Open System Guide & Tours"}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden lg:inline">
              {locale === "ar" ? "دليل النظام" : "System Guide"}
            </span>
          </button>

          {/* Contextual Current Page Tour Trigger ("?") */}
          <button
            type="button"
            onClick={startPageGuideForCurrentRoute}
            className="h-8 w-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--accent)] hover:border-[var(--accent)] flex items-center justify-center transition-colors cursor-pointer"
            title={locale === "ar" ? "شرح تفاعلي للشاشة الحالية" : "Explain current screen"}
            aria-label="Explain current screen"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Quick Create Dropdown */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateMenuOpen((prev) => !prev)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              <span className="hidden sm:inline">
                {locale === "ar" ? "إنشاء سريع" : "Create"}
              </span>
            </Button>

            {createMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setCreateMenuOpen(false)}
                />
                <div className="absolute end-0 mt-2 w-60 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-modal z-40 p-1.5 space-y-0.5">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] border-b border-[var(--border-subtle)] text-start">
                    {locale === "ar" ? "إجراء سريع في المشروع" : "Quick Create"}
                  </div>
                  {quickCreateLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setCreateMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="h-8 px-2.5 rounded-[var(--radius-sm)] flex items-center gap-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <Languages className="h-4 w-4 text-[var(--accent)]" />
            <span>{locale === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title={locale === "ar" ? "المظهر" : "Theme"}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-[var(--gold)]" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="h-8 w-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-[var(--gold)] ring-2 ring-[var(--surface)]" />
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute end-0 mt-2 w-80 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-modal z-40 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {locale === "ar" ? "الإشعارات" : "Notifications"} ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        {locale === "ar" ? "تحديد الكل كمقروء" : "Mark all read"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[var(--ink-secondary)] py-4 text-center">
                        {locale === "ar" ? "لا توجد إشعارات جديدة" : "No notifications"}
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2 rounded-[var(--radius-sm)] text-xs text-start transition-colors ${
                            !n.readAt
                              ? "bg-[var(--primary-subtle)] text-[var(--ink)] border border-[var(--accent)]/15"
                              : "text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          <div className="font-semibold">{n.type}</div>
                          <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US"
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-5 w-[1px] bg-[var(--border)] mx-1" />

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2">
            <Avatar name={user.name} size="sm" />
            <span className="hidden md:inline-block text-xs font-semibold text-[var(--ink)] max-w-[120px] truncate">
              {user.name}
            </span>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                title={t.auth.signOut}
                aria-label={t.auth.signOut}
              >
                <LogOut className="h-4 w-4 text-[var(--ink-secondary)]" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <GlobalSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        projectId={projectId}
        projectSlug={projectSlug}
      />
    </>
  );
}
