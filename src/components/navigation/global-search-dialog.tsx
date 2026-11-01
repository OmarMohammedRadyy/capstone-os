"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/context";
import {
  Search,
  CheckSquare,
  Flag,
  MessageSquare,
  FileText,
  Scale,
  AlertTriangle,
  Calendar,
  Loader2,
  LayoutDashboard,
  Briefcase,
  Compass,
  BarChart3,
  PackageCheck,
  Presentation,
  Settings,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearchDialog({
  isOpen,
  onClose,
  projectId,
  projectSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectSlug: string;
}) {
  const { locale } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = `/app/p/${projectSlug}`;

  const quickCommands = [
    {
      id: "nav-overview",
      title: locale === "ar" ? "الانتقال إلى لوحة القيادة (Overview)" : "Go to Executive Overview",
      subtitle: locale === "ar" ? "مؤشر صحة المشروع والتوصيات الفورية" : "Project health & priority actions",
      href: `${baseUrl}/overview`,
      icon: LayoutDashboard,
    },
    {
      id: "nav-my-work",
      title: locale === "ar" ? "مهامي اليوم (My Work / Today)" : "Go to My Work Today",
      subtitle: locale === "ar" ? "المهام المسندة والمواعيد القريبة" : "Assigned tasks & upcoming deadlines",
      href: `${baseUrl}/my-work`,
      icon: Briefcase,
    },
    {
      id: "nav-tasks",
      title: locale === "ar" ? "لوحة المهام والدورات (Tasks & Kanban)" : "Open Task Board & Sprints",
      subtitle: locale === "ar" ? "إدارة المهام، قوائم الفحص، وحالات الإنجاز" : "Manage tasks, checklists & dependencies",
      href: `${baseUrl}/tasks`,
      icon: CheckSquare,
    },
    {
      id: "nav-roadmap",
      title: locale === "ar" ? "خارطة الطريق والمحطات (Roadmap & Milestones)" : "Open Academic Roadmap",
      subtitle: locale === "ar" ? "اعتمادات المشرف والأدلة المرفقة" : "Supervisor approvals & milestone evidence",
      href: `${baseUrl}/roadmap`,
      icon: Compass,
    },
    {
      id: "nav-feedback",
      title: locale === "ar" ? "صندوق ملاحظات المشرف (Supervisor Feedback)" : "Open Supervisor Feedback",
      subtitle: locale === "ar" ? "معالجة الملاحظات وطلب التحقق الأكاديمي" : "Resolve & verify academic feedback",
      href: `${baseUrl}/feedback`,
      icon: MessageSquare,
    },
    {
      id: "nav-documents",
      title: locale === "ar" ? "مستودع الوثائق والإصدارات (Documents)" : "Open Document Repository",
      subtitle: locale === "ar" ? "سجل الإصدارات غير القابلة للتعديل SHA-256" : "Immutable versions & SHA-256 checksums",
      href: `${baseUrl}/documents`,
      icon: FileText,
    },
    {
      id: "nav-submissions",
      title: locale === "ar" ? "حزم التسليم والتجميد (Submissions & Freeze)" : "Open Deliverable Submissions",
      subtitle: locale === "ar" ? "تجميد لقطة التسليم النهائية" : "Freeze immutable submission snapshots",
      href: `${baseUrl}/submissions`,
      icon: PackageCheck,
    },
    {
      id: "nav-defense",
      title: locale === "ar" ? "غرفة عمليات المناقشة (Defense Center)" : "Open Defense Command Center",
      subtitle: locale === "ar" ? "توزيع المتحدثين وبنك أسئلة اللجنة" : "Speaker sections & jury Q&A bank",
      href: `${baseUrl}/defense`,
      icon: Presentation,
    },
    {
      id: "nav-analytics",
      title: locale === "ar" ? "تحليلات المساهمة العادلة (Contribution Analytics)" : "Open Contribution Analytics",
      subtitle: locale === "ar" ? "قياس المخرجات وتنبيهات تركز المعرفة" : "Evidence-based deliverables & Bus Factor",
      href: `${baseUrl}/analytics`,
      icon: BarChart3,
    },
    {
      id: "nav-settings",
      title: locale === "ar" ? "إعدادات المشروع والفريق (Workspace Settings)" : "Open Project & Team Settings",
      subtitle: locale === "ar" ? "الأعضاء، الدعوات، وأوزان محرك الصحة" : "Members, invitations & health weights",
      href: `${baseUrl}/settings`,
      icon: Settings,
    },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/projects/${projectId}/search?q=${encodeURIComponent(query)}&slug=${encodeURIComponent(projectSlug)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, projectId, projectSlug]);

  const handleSelect = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4 text-[var(--accent)]" />;
      case "milestone":
        return <Flag className="h-4 w-4 text-[var(--gold)]" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-[var(--copper)]" />;
      case "document":
        return <FileText className="h-4 w-4 text-[var(--accent)]" />;
      case "decision":
        return <Scale className="h-4 w-4 text-[var(--gold)]" />;
      case "risk":
      case "issue":
        return <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />;
      case "meeting":
        return <Calendar className="h-4 w-4 text-[var(--copper)]" />;
      default:
        return <Search className="h-4 w-4 text-[var(--ink-secondary)]" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden max-w-xl border-[var(--border)] bg-[var(--surface)]">
        <DialogTitle className="sr-only">Command Palette & Universal Search</DialogTitle>

        {/* Search Input Header */}
        <div className="p-3.5 border-b border-[var(--border)] flex items-center gap-2.5 bg-[var(--surface-elevated)]">
          <Search className="h-4 w-4 text-[var(--accent)] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === "ar"
                ? "ابحث في المهام، المحطات، الملاحظات، الوثائق، القرارات أو انتقل سريعًا..."
                : "Type a command or search tasks, milestones, feedback, documents..."
            }
            className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />}
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--ink-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results or Quick Navigation List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {query.trim() && results.length === 0 && !loading && (
            <p className="text-xs text-[var(--ink-secondary)] text-center py-8">
              {locale === "ar"
                ? `لا توجد نتائج مطابقة لـ "${query}"`
                : `No results found for "${query}"`}
            </p>
          )}

          {query.trim() && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] text-start">
                {locale === "ar" ? "نتائج البحث الشامل" : "Search Results"}
              </div>
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] text-start transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 p-1.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--ink)] truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--ink-muted)]">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!query.trim() && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] text-start">
                {locale === "ar"
                  ? "التنقل السريع ولوحة الأوامر (Command Palette)"
                  : "Quick Navigation & Commands"}
              </div>
              {quickCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.href)}
                    className="w-full flex items-center justify-between gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] text-start transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-[var(--surface-subtle)] text-[var(--accent)] group-hover:bg-[var(--primary-subtle)] transition-colors">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--ink)] truncate">
                          {cmd.title}
                        </p>
                        <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                          {cmd.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--ink-muted)] group-hover:text-[var(--accent)] rtl:rotate-180 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
