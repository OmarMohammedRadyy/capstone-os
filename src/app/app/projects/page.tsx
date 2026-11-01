import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getUserProjects } from "@/server/services/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { logoutAction } from "@/app/actions/auth-actions";
import { Plus, ArrowRight, Calendar, LogOut, Building2, FolderPlus } from "lucide-react";

export default async function ProjectsIndexPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const projects = await getUserProjects(user);

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      {/* Top Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between">
        <BrandLogo
          size="md"
          showText
          subtitle="منظومة إدارة مشاريع التخرج الأكاديمية"
        />

        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="text-xs text-start hidden sm:block">
            <div className="font-bold text-[var(--ink)]">{user.name}</div>
            <div className="text-[var(--ink-secondary)]">{user.email}</div>
          </div>
          <form action={logoutAction}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              خروج
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div className="text-start">
            <h1 className="text-2xl font-bold text-[var(--ink)]">
              مشاريع التخرج (Projects)
            </h1>
            <p className="text-xs text-[var(--ink-secondary)] mt-1">
              اختر المشروع للدخول إلى لوحة المتابعة، المهام، والملفات
            </p>
          </div>

          <Link href="/app/projects/new">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              إنشاء مشروع جديد
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-[var(--border)] max-w-xl mx-auto space-y-4 my-8">
            <div className="w-14 h-14 rounded-full bg-[var(--primary-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto">
              <FolderPlus className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[var(--ink)]">
                لا يوجد أي مشاريع مسجلة بعد
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed max-w-md mx-auto">
                ابدأ مسيرتك الأكاديمية بإنشاء مشروع تخرجك الفعلي، وسيتم توليد مراحل التخرج العشر تلقائياً لتتمكن من دعوة فريقك ومشرفك الأكاديمي.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/app/projects/new">
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                  إنشاء مشروع تخرجك الآن
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((p) => (
              <Link key={p.id} href={`/app/p/${p.slug}/overview`}>
                <Card
                  interactive
                  className="h-full flex flex-col justify-between space-y-4 text-start border-[var(--border)] hover:border-[var(--accent)]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="gold" size="sm">
                        {p.code}
                      </Badge>
                      <Badge variant="accent" size="sm" dot>
                        {p.status}
                      </Badge>
                    </div>

                    <h2 className="text-base font-bold text-[var(--ink)]">
                      {p.title}
                    </h2>

                    <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed">
                      {p.abstract || "لا يوجد ملخص مسجل لهذا المشروع."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span>{p.department}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[var(--gold)]" />
                        <span>{p.academicYear}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                      <span>فتح مساحة العمل</span>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
