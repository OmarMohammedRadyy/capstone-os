"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth-actions";
import { useTranslation } from "@/i18n/context";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Moon, Sun, Globe } from "lucide-react";

export default function RegisterPage() {
  const { t, locale, setLocale } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--canvas)] p-4 sm:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full py-2 border-b border-[var(--border)] pb-4">
        <BrandLogo
          size="md"
          showText
          subtitle={t.app.academicCenter}
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

      {/* Main Register Form */}
      <main className="flex items-center justify-center my-8">
        <div className="w-full max-w-[440px] space-y-4">
          <Card className="border border-[var(--border)] shadow-sm">
            <CardHeader className="text-start">
              <CardTitle className="text-xl font-bold text-[var(--ink)]">
                {t.auth.registerTitle}
              </CardTitle>
              <CardDescription className="text-xs text-[var(--ink-secondary)]">
                {t.auth.registerSubtitle}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {state?.error && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] leading-relaxed"
                >
                  {state.error}
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <Input
                  label={t.auth.name}
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Omar Khaled"
                />

                <Input
                  label={t.auth.email}
                  name="email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                />

                <Input
                  label={t.auth.password}
                  name="password"
                  type="password"
                  required
                  helperText={t.auth.passwordRequirements}
                />

                <Input
                  label={locale === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  name="confirmPassword"
                  type="password"
                  required
                />

                <input type="hidden" name="locale" value={locale} />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-10 mt-2 font-semibold"
                  loading={isPending}
                >
                  {t.auth.signUp}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-between items-center text-xs text-[var(--ink-secondary)] border-t border-[var(--border-subtle)] pt-4">
              <Link
                href="/login"
                className="text-[var(--accent)] hover:underline font-semibold"
              >
                {t.auth.alreadyHaveAccount}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--ink-muted)] py-4">
        <p>SVA-DUATE — Single Source of Truth for Academic Graduation Projects</p>
      </footer>
    </div>
  );
}
