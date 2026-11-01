"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth-actions";
import { useTranslation } from "@/i18n/context";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Moon,
  Sun,
  Globe,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const { t, locale, setLocale } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--canvas)] p-4 sm:p-8">
      {/* Top Institutional Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
        <BrandLogo
          size="md"
          showText
          subtitle={
            locale === "ar"
              ? "منظومة إدارة وحوكمة مشاريع التخرج الأكاديمية"
              : "Academic Graduation Project Operating System"
          }
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            leftIcon={<Globe className="h-4 w-4 text-[var(--accent)]" />}
          >
            {locale === "ar" ? "English" : "العربية"}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-[var(--gold)]" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--ink)]" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex items-center justify-center my-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          {/* Left / Start 5 Cols: Institutional Identity */}
          <div className="lg:col-span-5 space-y-6 text-start hidden lg:flex flex-col justify-between p-7 rounded-[var(--radius-lg)] bg-[#12301E] text-[#ECEFE9] border border-[#C89B2C]/30 shadow-modal">
            <div className="space-y-4">
              <Badge variant="gold" size="sm">
                {locale === "ar"
                  ? "الإصدار الأكاديمي المعتمد • 2026"
                  : "INSTITUTIONAL EDITION • 2026"}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight leading-snug text-white">
                {locale === "ar"
                  ? "المرجع الهندسي والأكاديمي الموحد لمشاريع التخرج"
                  : "The Single Source of Truth for Academic Engineering Projects"}
              </h1>
              <p className="text-xs text-[#B7E6C9]/85 leading-relaxed">
                {locale === "ar"
                  ? "منظومة عمل موحدة تجمع تخطيط المهام، اعتماد المحطات من المشرف، توثيق القرارات الهندسية (ADRs)، وتجميد التسليمات ببصمة SHA-256 الرقمية."
                  : "Unified workspace coordinating sprint execution, supervisor milestone approvals, architectural ADR records, and cryptographic deliverable freezes."}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#DFB244] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    {locale === "ar"
                      ? "محرك صحة المشروع سداسي الأبعاد"
                      : "6-Dimension Explainable Health Engine"}
                  </span>
                  <span className="text-[11px] text-[#9BA8A0]">
                    {locale === "ar"
                      ? "تقييم لحظي ومفسر لمخاطر الجدول الزمني وتوزيع المهام."
                      : "Continuous calculation of schedule, risk, feedback, and workload."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-[#DFB244] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    {locale === "ar"
                      ? "سجلات تدقيق وإصدارات غير قابلة للتعديل"
                      : "Append-Only Audit & Deliverable Integrity"}
                  </span>
                  <span className="text-[11px] text-[#9BA8A0]">
                    {locale === "ar"
                      ? "حماية كاملة للوثائق ولقطات التسليم وقرارات التصميم."
                      : "Cryptographic SHA-256 verification on every official submission."}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#9BA8A0] font-mono">
              <span>SVA-DUATE</span>
              <span className="text-[#DFB244]">Institutional Security • Argon2id</span>
            </div>
          </div>

          {/* Right / End 7 Cols: Real Sign In Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Card className="border border-[var(--border)] shadow-sm p-2 sm:p-4">
              <CardHeader className="text-start pb-4">
                <CardTitle className="text-xl font-bold text-[var(--ink)]">
                  {t.auth.loginTitle}
                </CardTitle>
                <CardDescription className="text-xs text-[var(--ink-secondary)]">
                  {t.auth.loginSubtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {state?.error && (
                  <div
                    role="alert"
                    className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] leading-relaxed"
                  >
                    {state.error}
                  </div>
                )}

                <form action={formAction} className="space-y-4">
                  <Input
                    label={t.auth.email}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                  />

                  <Input
                    label={t.auth.password}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 mt-2 font-semibold text-sm cursor-pointer"
                    loading={isPending}
                  >
                    {t.auth.signIn}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--ink-secondary)] border-t border-[var(--border-subtle)] pt-4 mt-2">
                <Link
                  href="/register"
                  className="text-[var(--accent)] hover:underline font-semibold"
                >
                  {t.auth.needAccount}
                </Link>
                <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                  Argon2id + Multi-Role RBAC
                </span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--ink-muted)] py-3 border-t border-[var(--border-subtle)] max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
        <span>SVA-DUATE — Institutional Academic Project Operating System</span>
        <span className="font-mono text-[11px]">Forest &amp; Gold Design System</span>
      </footer>
    </div>
  );
}
