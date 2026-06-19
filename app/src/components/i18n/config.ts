import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import es from "./es.json";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-CR",
};

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

export const LANGUAGE_STORAGE_KEY = "quietwealth.language";

export function normalizeLanguage(input?: string | null): LanguageCode {
  const base = (input ?? "").toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(base as LanguageCode)
    ? (base as LanguageCode)
    : DEFAULT_LANGUAGE;
}

function resolveInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored ? normalizeLanguage(stored) : normalizeLanguage(window.navigator.language);
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
  });
}

export { i18n };
