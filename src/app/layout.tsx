import type { Metadata } from "next";
import { cookies } from "next/headers";
import { I18nProvider } from "@/i18n/context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@/styles/sva-editorial.css";

export const metadata: Metadata = {
  title: "SVA-DUATE — Graduation Project Operating System",
  description: "SVA-DUATE — Enterprise Academic Command Center for Graduation Projects",
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const initialLocale = localeCookie === "en" ? "en" : "ar";
  const isRtl = initialLocale === "ar";

  const themeCookie = cookieStore.get("capstone_theme")?.value;
  const initialTheme = (themeCookie as "light" | "dark" | "system") || "system";

  return (
    <html lang={initialLocale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] antialiased transition-colors duration-200">
        <ThemeProvider defaultTheme={initialTheme}>
          <I18nProvider initialLocale={initialLocale}>
            {children}
            <Toaster
              position={isRtl ? "bottom-left" : "bottom-right"}
              richColors
              closeButton
              theme="system"
            />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
