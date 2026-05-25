import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { themes, toThemeCssVariables, type ThemeName } from "./theme";

const THEME_STORAGE_KEY = "app.theme";
const DEFAULT_THEME = "innovatax" satisfies ThemeName;

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeName(value: string): value is ThemeName {
  return value in themes;
}

function readStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedValue && isThemeName(storedValue) ? storedValue : DEFAULT_THEME;
}

function applyTheme(themeName: ThemeName) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const theme = themes[themeName];

  root.dataset.theme = themeName;
  root.style.colorScheme = theme.appearance;

  for (const [name, value] of Object.entries(toThemeCssVariables(theme))) {
    root.style.setProperty(name, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      availableThemes: Object.keys(themes) as ThemeName[],
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function useTheme() {
  return useThemeContext();
}
