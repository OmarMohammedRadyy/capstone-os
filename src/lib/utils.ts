import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | null | undefined,
  locale: string = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(d);
}

export function formatDateTime(
  date: Date | string | null | undefined,
  locale: string = "en"
): string {
  return formatDate(date, locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(
  date: Date | string | null | undefined,
  locale: string = "en"
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffSec = Math.round((d.getTime() - now.getTime()) / 1000);
  const diffDays = Math.round(diffSec / 86400);

  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    numeric: "auto",
  });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  }

  const diffHours = Math.round(diffSec / 3600);
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  }

  const diffMinutes = Math.round(diffSec / 60);
  return rtf.format(diffMinutes, "minute");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

