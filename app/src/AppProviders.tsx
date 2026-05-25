import type { ReactNode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { AppErrorBoundary } from "./components/molecules/app-error-boundary";
import { I18nProvider } from "./components/i18n/I18nProvider";
import { SessionProvider } from "./state/SessionProvider";
import { ThemeProvider } from "./components/styles/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppErrorBoundary>
          <SessionProvider>
            <AuthProvider>{children}</AuthProvider>
          </SessionProvider>
        </AppErrorBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}
