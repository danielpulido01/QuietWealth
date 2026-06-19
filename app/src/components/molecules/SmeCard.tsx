import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../atoms/StatusBadge";
import { Surface } from "../atoms/Surface";
import type { SmeProfile } from "../../models/local-mvp";
import { useI18n } from "../i18n/I18nProvider";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatters";

export function SmeCard({ company }: { company: SmeProfile }) {
  const { t } = useTranslation();
  const { locale } = useI18n();

  return (
    <Surface className="company-card">
      <div className="company-card__header">
        <div>
          <h2>{company.name}</h2>
          <p>{t(`sectors.${company.sector}`)}</p>
        </div>
        <StatusBadge status={company.certificationStatus} />
      </div>

      <p className="company-card__description">{company.description}</p>

      <dl className="company-card__metrics">
        <div>
          <dt>{t("marketplace.card.growth")}</dt>
          <dd>{formatPercent(company.growthRate, locale)}</dd>
        </div>
        <div>
          <dt>{t("marketplace.card.raised")}</dt>
          <dd>{formatCurrency(company.totalRaised, locale)}</dd>
        </div>
        <div>
          <dt>{t("marketplace.card.investors")}</dt>
          <dd>{formatNumber(company.activeInvestors, locale)}</dd>
        </div>
        <div>
          <dt>{t("marketplace.card.trust")}</dt>
          <dd>{t("marketplace.card.trustValue", { value: company.trustLevel })}</dd>
        </div>
      </dl>

      <Link className="card-link" to={`/marketplace/${company.id}`}>
        {t("marketplace.card.viewDetails")}
      </Link>
    </Surface>
  );
}
