import { colors, radius, spacing, typography } from "./tokens";

export type Theme = {
  appearance: "light" | "dark";
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const themes = {
  innovatax: {
    appearance: "light",
    colors,
    spacing,
    radius,
    typography,
  },
  midnight: {
    appearance: "dark",
    colors: {
      ...colors,
      background: "#0d1524",
      foreground: "#ecf2ff",
      card: "#111c2e",
      cardForeground: "#ecf2ff",
      popover: "#111c2e",
      popoverForeground: "#ecf2ff",
      primary: "#84ccff",
      primaryForeground: "#0b1728",
      secondary: "#3dd9c2",
      secondaryForeground: "#052521",
      muted: "#172338",
      mutedForeground: "#a6b4cd",
      accent: "#1b2942",
      accentForeground: "#ecf2ff",
      destructive: "#ff7f9a",
      destructiveForeground: "#2a0611",
      border: "rgba(166, 180, 205, 0.18)",
      inputBackground: "#162236",
      switchBackground: "#39506f",
      ring: "rgba(132, 204, 255, 0.45)",
      chart1: "#84ccff",
      chart2: "#3dd9c2",
      chart3: "#c084fc",
      chart4: "#fbbf24",
      chart5: "#34d399",
      sidebar: "#0f1a2b",
      sidebarForeground: "#ecf2ff",
      sidebarPrimary: "#84ccff",
      sidebarPrimaryForeground: "#0b1728",
      sidebarAccent: "#172338",
      sidebarAccentForeground: "#ecf2ff",
      sidebarBorder: "rgba(166, 180, 205, 0.16)",
      sidebarRing: "rgba(132, 204, 255, 0.45)",
      brandStart: "#6d5efc",
      brandMid: "#3e87ff",
      brandEnd: "#3dd9c2",
      surfaceAlt: "#132037",
      success: "#4ade80",
      successSoft: "#11261c",
      successText: "#8df0b1",
      successBorder: "#1d5d37",
      info: "#38bdf8",
      infoSoft: "#102432",
      infoText: "#91ddff",
      infoBorder: "#21556e",
      warning: "#fbbf24",
      warningSoft: "#30240e",
      warningText: "#fcd56b",
      warningBorder: "#6b5216",
      danger: "#fb7185",
      dangerSoft: "#2f1018",
      dangerText: "#ffb1bf",
      dangerBorder: "#6e2231",
    },
    spacing,
    radius,
    typography: {
      ...typography,
      fontFamily: "\"Trebuchet MS\", \"Segoe UI\", sans-serif",
    },
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;

function camelToKebab(value: string) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function toThemeCssVariables(theme: Theme) {
  const entries: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(theme.colors)) {
    entries.push([`--token-color-${camelToKebab(key)}`, value]);
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    entries.push([`--token-space-${key}`, value]);
  }

  for (const [key, value] of Object.entries(theme.radius)) {
    entries.push([`--token-radius-${key}`, value]);
  }

  entries.push(["--token-typography-font-family", theme.typography.fontFamily]);
  entries.push(["--token-typography-mono-family", theme.typography.monoFamily]);
  entries.push(["--token-typography-heading-weight", theme.typography.headingWeight]);
  entries.push(["--token-typography-body-weight", theme.typography.bodyWeight]);

  return Object.fromEntries(entries);
}

