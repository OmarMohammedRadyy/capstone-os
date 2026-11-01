import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export type Locale = "ar" | "en";

export const defaultLocale: Locale = "ar";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

