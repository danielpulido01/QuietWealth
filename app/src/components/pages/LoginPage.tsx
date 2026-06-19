import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { RolePicker } from "../molecules/RolePicker";
import type { UserRole } from "../../models/local-mvp";

type LoginPageProps = {
  onLogin: (role: UserRole) => Promise<boolean>;
  isSubmitting: boolean;
  errorKey: string | null;
};

const benefits = ["certification", "marketplace", "investment"] as const;

const nextRouteByRole: Record<UserRole, string> = {
  Investor: "/marketplace",
  SME: "/documents",
  Expert: "/validation",
};

export function LoginPage({ onLogin, isSubmitting, errorKey }: LoginPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("Investor");

  async function handleLogin() {
    const ok = await onLogin(role);
    if (ok) {
      navigate(nextRouteByRole[role], { replace: true });
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__brand">
        <div className="login-page__brand-mark" aria-hidden="true">↗</div>
        <h1>{t("brand.name")}</h1>
        <p className="login-page__lead">{t("login.hero")}</p>

        <div className="benefit-list">
          {benefits.map((benefit) => (
            <article className={`benefit-card benefit-card--${benefit}`} key={benefit}>
              <span className="benefit-card__icon" aria-hidden="true" />
              <div>
                <strong>{t(`login.benefits.${benefit}.title`)}</strong>
                <p>{t(`login.benefits.${benefit}.description`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="login-page__panel">
        <p className="eyebrow">{t("login.panelEyebrow")}</p>
        <h2>{t("login.title")}</h2>
        <p>{t("login.subtitle")}</p>

        <label className="field">
          <span>{t("login.role.label")}</span>
          <RolePicker selectedRole={role} onSelect={setRole} />
        </label>

        <Button block size="lg" className="login-page__microsoft-button" icon={<span className="microsoft-mark"><i /><i /><i /><i /></span>} onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? t("login.ctaLoading") : t("login.cta")}
        </Button>

        <div className="info-banner" aria-live="polite">
          <strong>{t("login.sso.title")}</strong>
          <p>{t("login.sso.description")}</p>
        </div>

        {errorKey ? (
          <p className="form-error" aria-live="polite">
            {t(errorKey)}
          </p>
        ) : null}

        <p className="legal-copy">
          {t("login.legal.prefix")} <Link to="/terms">{t("login.legal.terms")}</Link>{" "}
          {t("login.legal.and")} <Link to="/privacy">{t("login.legal.privacy")}</Link>.
        </p>
      </section>
    </main>
  );
}



