"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Input } from "@/components/ui/input";
import {
  acceptProjectInviteAction,
  quickLoginAndAcceptInviteAction,
} from "@/app/actions/project-actions";
import {
  ShieldCheck,
  GraduationCap,
  Crown,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogIn,
  UserPlus,
  Lock,
  Sparkles,
  Layers,
  Calendar,
  Building2,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface InviteAcceptCardProps {
  token: string;
  invite: {
    id: string;
    email: string | null;
    role: ProjectRole;
    expiresAt: string | Date;
    maxUses: number;
    useCount: number;
    createdBy?: {
      name: string;
      email: string;
    } | null;
    project: {
      id: string;
      slug: string;
      title: string;
      code: string;
      abstract: string | null;
      academicYear: string;
      department: string;
    };
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  isAlreadyMember: boolean;
  existingMemberRole?: ProjectRole | null;
}

export function InviteAcceptCard({
  token,
  invite,
  currentUser,
  isAlreadyMember,
  existingMemberRole,
}: InviteAcceptCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-filled credentials from hash or query
  const [loginEmail, setLoginEmail] = useState(invite.email || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [hasAutoCredentials, setHasAutoCredentials] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : "";
      const search = window.location.search.startsWith("?")
        ? window.location.search.substring(1)
        : "";

      const params = new URLSearchParams(hash || search);
      const emailParam = params.get("email");
      const pwdParam = params.get("pwd") || params.get("password");

      if (emailParam) {
        setLoginEmail(emailParam);
      }
      if (pwdParam) {
        setLoginPassword(pwdParam);
        setHasAutoCredentials(true);
      }
    }
  }, []);

  const isEmailRestricted = Boolean(invite.email);
  const isEmailMatching =
    currentUser &&
    invite.email &&
    currentUser.email.toLowerCase() === invite.email.toLowerCase();
  const isEmailMismatch = currentUser && invite.email && !isEmailMatching;

  async function handleAcceptLoggedIn() {
    setLoading(true);
    setError(null);
    try {
      const res = await acceptProjectInviteAction(token);
      if (res.success && res.projectSlug) {
        toast.success(`مرحباً بك! تم انضمامك إلى مشروع (${res.projectTitle}) بنجاح`);
        router.push(`/app/p/${res.projectSlug}/overview`);
      } else {
        setError(res.error || "فشل قبول الدعوة");
        toast.error(res.error || "فشل قبول الدعوة");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع أثناء قبول الدعوة");
      toast.error("حدث خطأ أثناء قبول الدعوة");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLoginAndAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور المسلمة لك في الدعوة");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await quickLoginAndAcceptInviteAction(
        token,
        loginEmail.trim(),
        loginPassword.trim()
      );
      if (res.success && res.projectSlug) {
        toast.success(`مرحباً بك! تم تسجيل دخولك بنجاح وانضمامك إلى مشروع (${res.projectTitle})`);
        router.push(`/app/p/${res.projectSlug}/overview`);
      } else {
        setError(res.error || "فشل تسجيل الدخول أو قبول الدعوة");
        toast.error(res.error || "فشل تسجيل الدخول وقبول الدعوة");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء تسجيل الدخول وقبول الدعوة");
      toast.error("حدث خطأ أثناء المعالجة");
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = getRoleArabicName(invite.role);

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between max-w-2xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
        <BrandLogo
          size="md"
          showText
          subtitle="منظومة إدارة وحوكمة مشاريع التخرج الهندسية"
        />
        <Badge variant="outline" className="text-xs font-mono text-[var(--gold)] border-[#C9A13C]/30">
          Official Invite
        </Badge>
      </header>

      {/* Main Container */}
      <main className="flex items-center justify-center my-8 max-w-xl mx-auto w-full">
        <Card className="w-full border border-[var(--border)] shadow-modal overflow-hidden bg-[var(--surface)]">
          {/* Card Accent Top Banner */}
          <div className="h-2 w-full bg-gradient-to-r from-[#12301E] via-[#C9A13C] to-[#12301E]" />

          <CardHeader className="text-start pb-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Badge
                variant="gold"
                className="text-xs px-2.5 py-0.5 bg-[#C9A13C]/15 text-[#C9A13C] border-[#C9A13C]/30"
              >
                دعوة انضمام رسمية لمشروع تخرج
              </Badge>
              <span className="text-[11px] font-mono text-[var(--ink-secondary)]">
                كود: {invite.project.code}
              </span>
            </div>

            <CardTitle className="text-xl font-bold text-[var(--ink)] mt-2">
              {invite.project.title}
            </CardTitle>

            <div className="flex items-center gap-4 text-xs text-[var(--ink-secondary)] mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#C9A13C]" />
                {invite.project.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                العام الأكاديمي: {invite.project.academicYear}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-5 text-xs">
            {error && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 leading-relaxed flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Invited Role & Sender Details */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--ink-secondary)]">الدور المخصص عند الانضمام:</span>
                <Badge
                  className={
                    invite.role === ProjectRole.SUPERVISOR
                      ? "bg-indigo-500/15 text-indigo-500 border-indigo-500/30 font-bold"
                      : invite.role === ProjectRole.TEAM_LEADER
                      ? "bg-[#C9A13C]/15 text-[#C9A13C] border-[#C9A13C]/30 font-bold"
                      : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold"
                  }
                >
                  {invite.role === ProjectRole.SUPERVISOR && <GraduationCap className="h-3 w-3 ml-1" />}
                  {invite.role === ProjectRole.TEAM_LEADER && <Crown className="h-3 w-3 ml-1" />}
                  {invite.role === ProjectRole.STUDENT && <Users className="h-3 w-3 ml-1" />}
                  {roleLabel}
                </Badge>
              </div>

              {invite.createdBy && (
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/60 text-[11px]">
                  <span className="text-[var(--ink-secondary)]">مرسل الدعوة:</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {invite.createdBy.name} ({invite.createdBy.email})
                  </span>
                </div>
              )}

              {invite.project.abstract && (
                <div className="pt-2 border-t border-[var(--border)]/60">
                  <span className="text-[11px] text-[var(--ink-secondary)] block mb-1">
                    ملخص وميثاق المشروع:
                  </span>
                  <p className="text-[11px] text-[var(--ink)] leading-relaxed italic bg-[var(--surface)] p-2.5 rounded border border-[var(--border)]/40">
                    &quot;{invite.project.abstract}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* If user is already logged in */}
            {currentUser && (
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={currentUser.name} className="h-8 w-8 text-xs" />
                  <div>
                    <span className="font-bold text-[var(--ink)] block">{currentUser.name}</span>
                    <span className="text-[11px] text-[var(--ink-secondary)]">{currentUser.email}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-500" />
                  مسجل الدخول حالياً
                </Badge>
              </div>
            )}

            {/* Email Mismatch Alert */}
            {isEmailMismatch && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300 space-y-1">
                <span className="font-bold block">تنبيه: عدم تطابق البريد الجامعي</span>
                <p className="text-[11px] leading-relaxed">
                  هذه الدعوة مخصصة للبريد: <strong className="font-mono underline">{invite.email}</strong>.
                  أنت مسجل حالياً بحساب ({currentUser?.email}). يرجى تسجيل الدخول بالبريد المخصص للدعوة.
                </p>
              </div>
            )}

            {/* Case: Not Logged In -> Dedicated Direct Credentials Login Card */}
            {!currentUser && !isAlreadyMember && (
              <div className="p-4 rounded-xl border border-[#C9A13C]/40 bg-[var(--surface-muted)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                  <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-[#C9A13C]" />
                    تسجيل الدخول المباشر ببيانات الدعوة المسلمة لك
                  </span>
                  {hasAutoCredentials && (
                    <Badge variant="gold" className="text-[9px]">
                      بيانات معتمدة تلقائياً
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-[var(--ink-secondary)] leading-relaxed">
                  أنشأ لك متصدر/مشرف المشروع حساباً رسمياً. يمكنك تأكيد الدخول مباشرة والانضمام للمشروع بنقرة واحدة:
                </p>

                <form onSubmit={handleQuickLoginAndAccept} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[var(--ink)] font-medium mb-1">
                      البريد الإلكتروني الجامعي للدعوة:
                    </label>
                    <Input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--ink)] font-medium mb-1">
                      كلمة المرور المؤقتة المسلمة لك:
                    </label>
                    <div className="relative">
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="font-mono text-xs pr-2.5 pl-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                      >
                        {showLoginPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !loginEmail || !loginPassword}
                    className="w-full h-11 text-sm font-bold bg-[#C9A13C] hover:bg-[#b08c32] text-black shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    {loading ? "جاري تسجيل الدخول وتفعيل العضوية..." : "تسجيل الدخول وقبول الدعوة فوراً"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6 border-t border-[var(--border)] flex flex-col gap-3">
            {/* Case 1: Already an active member */}
            {isAlreadyMember ? (
              <div className="w-full space-y-2 text-center">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    أنت بالفعل عضو نشط في هذا المشروع بدور ({getRoleArabicName(existingMemberRole || invite.role)})
                  </span>
                </div>
                <Button
                  onClick={() => router.push(`/app/p/${invite.project.slug}/overview`)}
                  className="w-full h-10 font-bold bg-[#12301E] hover:bg-[#1b442b] text-white flex items-center justify-center gap-2"
                >
                  الانتقال إلى مساحة عمل المشروع مباشرة
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : currentUser ? (
              /* Case 2: Logged in and ready to join */
              isEmailMismatch ? (
                <div className="w-full space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/login?redirectTo=/invite/${token}`)}
                    className="w-full h-10 text-xs font-bold text-rose-600 border-rose-500/30"
                  >
                    تسجيل الدخول بحساب ({invite.email})
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAcceptLoggedIn}
                  disabled={loading}
                  className="w-full h-11 text-sm font-bold bg-[#C9A13C] hover:bg-[#b08c32] text-black shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? "جاري قبول الدعوة وتفعيل العضوية..." : `قبول الدعوة والانضمام للمشروع كـ (${roleLabel})`}
                </Button>
              )
            ) : (
              /* Additional standard links */
              <div className="flex items-center justify-between text-xs text-[var(--ink-secondary)] w-full pt-1">
                <Link
                  href={`/login?redirectTo=/invite/${token}`}
                  className="hover:underline flex items-center gap-1 text-[var(--ink)] font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  تسجيل الدخول عبر صفحة الدخول العامة
                </Link>

                <Link
                  href={`/register?redirectTo=/invite/${token}`}
                  className="hover:underline flex items-center gap-1 text-[var(--ink-secondary)]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  إنشاء حساب جديد ببريد آخر
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[var(--ink-secondary)] max-w-xl mx-auto w-full pt-4 border-t border-[var(--border)]">
        منظومة SVA-DUATE الأكاديمية • تشفير آمن للروابط مع بصمة SHA-256 وتجهيز فوري لبيانات الاعتماد
      </footer>
    </div>
  );
}

function getRoleArabicName(role: ProjectRole): string {
  switch (role) {
    case ProjectRole.STUDENT:
      return "طالب (Student)";
    case ProjectRole.TEAM_LEADER:
      return "متصدر الفريق (Team Leader)";
    case ProjectRole.SUPERVISOR:
      return "مشرف أكاديمي (Supervisor)";
    case ProjectRole.DEPARTMENT_ADMIN:
      return "إدارة القسم (Department Admin)";
    default:
      return role;
  }
}
