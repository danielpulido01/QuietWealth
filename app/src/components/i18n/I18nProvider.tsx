import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LOCALES,
  SUPPORTED_LANGUAGES,
  resources,
  type LanguageCode,
} from "./config";

const LANGUAGE_STORAGE_KEY = "innovatax-language";

export type TranslationValues = Record<string, number | string>;

export type I18nContextValue = {
  language: LanguageCode;
  locale: string;
  supportedLanguages: readonly LanguageCode[];
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, values?: TranslationValues) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(value as LanguageCode);
}

function readStoredLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedValue && isLanguageCode(storedValue) ? storedValue : DEFAULT_LANGUAGE;
}

function getTranslation(language: LanguageCode, key: string) {
  const translationMap = resources[language].translation as Record<string, unknown>;

  if (key in translationMap) {
    return translationMap[key];
  }

  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, translationMap);
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? "" : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => readStoredLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
    document.documentElement.lang = nextLanguage;
  };

  const value = useMemo<I18nContextValue>(() => ({
    language,
    locale: LANGUAGE_LOCALES[language],
    supportedLanguages: SUPPORTED_LANGUAGES,
    setLanguage,
    t: (key, values) => {
      const translation = getTranslation(language, key);
      return typeof translation === "string" ? interpolate(translation, values) : key;
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }

  return context;
}

