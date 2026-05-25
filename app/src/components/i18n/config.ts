// src/i18n/config.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import es from "./es.json";
//import new languagges

export const SUPPORTED_LANGUAGES = ["en", "es"] as const; // add other languages
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { translation: en },
  es: { translation: es },
  //add new language to this const
};

const STORAGE_KEY = "app.language";

function normalizeLanguage(input?: string | null): LanguageCode {
  const base = (input ?? "").toLowerCase().split("-")[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base) ? (base as LanguageCode) : "en";
}

const saved = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
const browser = normalizeLanguage(navigator.language);

i18n.use(initReactI18next).init({
  resources,
  lng: saved || browser,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export async function setLanguage(lang: string) {
  const safe = normalizeLanguage(lang);
  await i18n.changeLanguage(safe);
  localStorage.setItem(STORAGE_KEY, safe);
}

