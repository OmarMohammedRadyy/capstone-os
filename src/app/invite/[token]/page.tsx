import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { sha256 } from "@/server/lib/crypto";
import { InviteAcceptCard } from "./invite-accept-card";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, Home } from "lucide-react";

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = sha256(token);

  const invite = await prisma.projectInvite.findUnique({
    where: { tokenHash },
    include: {
      project: {
        select: {
          id: true,
          slug: true,
          title: true,
          code: true,
          abstract: true,
          academicYear: true,
          department: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Current session user (if signed in)
  const user = await getCurrentUser();

  // If token is not found in database
  if (!invite) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8" dir="rtl">
        <header className="flex items-center justify-between max-w-xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
          <BrandLogo size="md" showText subtitle="منظومة إدارة وحوكمة مشاريع التخرج" />
        </header>

        <main className="flex items-center justify-center my-8 max-w-md mx-auto w-full">
          <Card className="w-full border border-rose-500/30 shadow-md bg-[var(--surface)] text-center">
            <CardHeader className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                رابط الدعوة غير صالح أو غير موجود
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              تعذر العثور على دعوة مطابقة لهذا الرابط. يرجى التأكد من نسخ الرابط كاملاً، أو التواصل مع متصدر الفريق أو المشرف لإرسال دعوة جديدة.
            </CardContent>
            <CardFooter className="pt-2 justify-center">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5" />
                  العودة للرئيسية
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <footer className="text-center text-[11px] text-[var(--ink-secondary)] max-w-xl mx-auto w-full pt-4 border-t border-[var(--border)]">
          منظومة SVA-DUATE الأكاديمية
        </footer>
      </div>
    );
  }

  // If token was revoked
  if (invite.revokedAt) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8" dir="rtl">
        <header className="flex items-center justify-between max-w-xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
          <BrandLogo size="md" showText subtitle="منظومة إدارة وحوكمة مشاريع التخرج" />
        </header>

        <main className="flex items-center justify-center my-8 max-w-md mx-auto w-full">
          <Card className="w-full border border-amber-500/30 shadow-md bg-[var(--surface)] text-center">
            <CardHeader className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                تم إلغاء رابط الدعوة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--ink-secondary)] leading-relaxed space-y-1">
              <p>تم تجميد أو إلغاء هذا الرابط رسمياً من قِبل إدارة مشروع ({invite.project.title}).</p>
              <p className="text-[11px]">يرجى مراجعة قيادة الفريق للحصول على رابط صالح ومحدث.</p>
            </CardContent>
            <CardFooter className="pt-2 justify-center">
              <Link href="/app">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5" />
                  الانتقال لمنصة المشاريع
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <footer className="text-center text-[11px] text-[var(--ink-secondary)] max-w-xl mx-auto w-full pt-4 border-t border-[var(--border)]">
          منظومة SVA-DUATE الأكاديمية
        </footer>
      </div>
    );
  }

  // If token has expired
  if (new Date(invite.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8" dir="rtl">
        <header className="flex items-center justify-between max-w-xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
          <BrandLogo size="md" showText subtitle="منظومة إدارة وحوكمة مشاريع التخرج" />
        </header>

        <main className="flex items-center justify-center my-8 max-w-md mx-auto w-full">
          <Card className="w-full border border-rose-500/30 shadow-md bg-[var(--surface)] text-center">
            <CardHeader className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                انتهت صلاحية رابط الدعوة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--ink-secondary)] leading-relaxed space-y-1">
              <p>
                انتهت صلاحية هذه الدعوة للانضمام لمشروع ({invite.project.title}) في:{" "}
                <span className="font-mono text-[var(--ink)] font-semibold">
                  {new Date(invite.expiresAt).toLocaleDateString("ar-EG")}
                </span>.
              </p>
              <p className="text-[11px]">يرجى طلب رابط دعوة جديد من متصدر الفريق.</p>
            </CardContent>
            <CardFooter className="pt-2 justify-center">
              <Link href="/app">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5" />
                  الانتقال لمنصة المشاريع
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <footer className="text-center text-[11px] text-[var(--ink-secondary)] max-w-xl mx-auto w-full pt-4 border-t border-[var(--border)]">
          منظومة SVA-DUATE الأكاديمية
        </footer>
      </div>
    );
  }

  // If max uses exceeded
  if (invite.useCount >= invite.maxUses) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8" dir="rtl">
        <header className="flex items-center justify-between max-w-xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
          <BrandLogo size="md" showText subtitle="منظومة إدارة وحوكمة مشاريع التخرج" />
        </header>

        <main className="flex items-center justify-center my-8 max-w-md mx-auto w-full">
          <Card className="w-full border border-blue-500/30 shadow-md bg-[var(--surface)] text-center">
            <CardHeader className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                تم استخدام رابط الدعوة بالكامل
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              وصل هذا الرابط للحد الأقصى المسموح به من مرات الانضمام. يرجى طلب رابط دعوة شخصي من متصدر الفريق.
            </CardContent>
            <CardFooter className="pt-2 justify-center">
              <Link href="/app">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5" />
                  الانتقال لمنصة المشاريع
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <footer className="text-center text-[11px] text-[var(--ink-secondary)] max-w-xl mx-auto w-full pt-4 border-t border-[var(--border)]">
          منظومة SVA-DUATE الأكاديمية
        </footer>
      </div>
    );
  }

  // Check if current user is already an active member of this project
  let isAlreadyMember = false;
  let existingMemberRole = null;

  if (user) {
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: invite.projectId,
          userId: user.id,
        },
      },
    });
    if (existing && existing.active) {
      isAlreadyMember = true;
      existingMemberRole = existing.role;
    }
  }

  return (
    <InviteAcceptCard
      token={token}
      invite={invite as any}
      currentUser={
        user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null
      }
      isAlreadyMember={isAlreadyMember}
      existingMemberRole={existingMemberRole}
    />
  );
}

