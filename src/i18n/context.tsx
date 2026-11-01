"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import { en } from "./dictionaries/en";
import type { Locale } from "./get-dictionary";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  initialLocale = "ar",
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value: I18nContextType = {
    locale,
    setLocale,
    t: locale === "ar" ? ar : en,
    isRtl: locale === "ar",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}

