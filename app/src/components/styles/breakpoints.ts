// src/styles/breakpoints.ts
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const mq = {
  tabletUp: `(min-width: ${breakpoints.tablet}px)`,
  desktopUp: `(min-width: ${breakpoints.desktop}px)`,
} as const;
