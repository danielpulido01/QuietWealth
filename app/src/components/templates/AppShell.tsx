import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { useI18n } from "../i18n/I18nProvider";
import type { UserRole } from "../../models/local-mvp";

type AppShellProps = {
  role: UserRole;
  onLogout: () => void;
  isLoggingOut: boolean;
  children: ReactNode;
};

const navItemsByRole: Record<UserRole, Array<{ to: string; labelKey: string }>> = {
  Investor: [{ to: "/marketplace", labelKey: "nav.marketplace" }],
  SME: [{ to: "/documents", labelKey: "nav.documents" }],
  Expert: [{ to: "/validation", labelKey: "nav.validation" }],
};

export function AppShell({ role, onLogout, isLoggingOut, children }: AppShellProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useI18n();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <p className="eyebrow">{t("brand.productTag")}</p>
          <h1>{t("brand.name")}</h1>
          <p>{t("brand.sidebarSummary")}</p>
        </div>

        <nav className="app-sidebar__nav" aria-label={t("nav.label")}>
          {navItemsByRole[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link--active" : ""}`}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="language-switcher" role="group" aria-label={t("common.language.label")}>
            <Button
              variant={language === "es" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => void setLanguage("es")}
            >
              ES
            </Button>
            <Button
              variant={language === "en" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => void setLanguage("en")}
            >
              EN
            </Button>
          </div>

          <Button variant="ghost" block onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? t("common.status.signingOut") : t("nav.logout")}
          </Button>
        </div>
      </aside>

      <div className="app-shell__content">{children}</div>
    </div>
  );
}
