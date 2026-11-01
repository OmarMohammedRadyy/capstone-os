"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { login, register, logout } from "@/server/services/auth";
import { AppError } from "@/server/lib/errors";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  try {
    await login(email, password, ip, userAgent);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "An unexpected error occurred during sign in." };
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/app";
  redirect(redirectTo.startsWith("/") ? redirectTo : "/app");
}

export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const locale = (formData.get("locale") as string) || "ar";

  if (!email || !name || !password) {
    return { error: "Please fill in all required fields." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    await register(email, name, password, locale);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "An unexpected error occurred during registration." };
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/app";
  redirect(redirectTo.startsWith("/") ? redirectTo : "/app");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}

