import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  i18n,
  LANGUAGE_LOCALES,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "./config";

export type I18nContextValue = {
  language: LanguageCode;
  locale: string;
  supportedLanguages: readonly LanguageCode[];
  setLanguage: (language: LanguageCode) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedValue ? normalizeLanguage(storedValue) : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => readStoredLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = async (nextLanguage: LanguageCode) => {
    const safeLanguage = normalizeLanguage(nextLanguage);
    setLanguageState(safeLanguage);
    await i18n.changeLanguage(safeLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
    }
    document.documentElement.lang = safeLanguage;
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: LANGUAGE_LOCALES[language],
      supportedLanguages: SUPPORTED_LANGUAGES,
      setLanguage,
    }),
    [language],
  );

  return (
    <I18nContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
