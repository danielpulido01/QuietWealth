import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MetricCard } from "../molecules/MetricCard";
import { StatusBadge } from "../atoms/StatusBadge";
import { Surface } from "../atoms/Surface";
import { useSmeDetail } from "../hooks/useSmeDetail";
import { useI18n } from "../i18n/I18nProvider";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatters";

export function InvestmentDetailPage() {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { id } = useParams();
  const { company, isLoading, error } = useSmeDetail(id);

  if (isLoading) {
    return <main className="page inline-message">{t("common.status.loading")}</main>;
  }

  if (!company || error) {
    return <main className="page inline-message">{t(error ?? "common.errors.notFound")}</main>;
  }

  return (
    <main className="page">
      <Link className="back-link" to="/marketplace">
        {t("investmentDetail.back")}
      </Link>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">{t("investmentDetail.eyebrow")}</p>
          <h1>{company.name}</h1>
          <p>
            {t(`sectors.${company.sector}`)} • {t("investmentDetail.summary")}
          </p>
        </div>

        <div className="detail-hero__actions">
          <StatusBadge status={company.certificationStatus} />
          <Link className="card-link card-link--inline" to={`/invest/${company.id}`}>
            {t("investmentDetail.cta")}
          </Link>
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard
          accent="success"
          title={t("investmentDetail.metrics.raised")}
          value={formatCurrency(company.totalRaised, locale)}
          note={t("investmentDetail.metrics.raisedNote")}
        />
        <MetricCard
          accent="info"
          title={t("investmentDetail.metrics.investors")}
          value={formatNumber(company.activeInvestors, locale)}
          note={t("investmentDetail.metrics.investorsNote")}
        />
        <MetricCard
          accent="primary"
          title={t("investmentDetail.metrics.growth")}
          value={formatPercent(company.growthRate, locale)}
          note={t("investmentDetail.metrics.growthNote")}
        />
        <MetricCard
          accent="warning"
          title={t("investmentDetail.metrics.roi")}
          value={formatPercent(company.averageRoi, locale)}
          note={t("investmentDetail.metrics.roiNote")}
        />
      </div>

      <div className="detail-grid">
        <Surface className="detail-copy">
          <h2>{t("investmentDetail.decisionPacketTitle")}</h2>
          <p>{company.description}</p>
          <dl className="definition-list">
            <div>
              <dt>{t("investmentDetail.highlights.trust")}</dt>
              <dd>{t("marketplace.card.trustValue", { value: company.trustLevel })}</dd>
            </div>
            <div>
              <dt>{t("investmentDetail.highlights.retention")}</dt>
              <dd>{formatPercent(company.retentionRate, locale)}</dd>
            </div>
            <div>
              <dt>{t("investmentDetail.highlights.mrr")}</dt>
              <dd>{formatCurrency(company.mrr, locale)}</dd>
            </div>
            <div>
              <dt>{t("investmentDetail.highlights.margin")}</dt>
              <dd>{formatPercent(company.profitMargin, locale)}</dd>
            </div>
          </dl>
        </Surface>

        <Surface className="detail-copy">
          <h2>{t("investmentDetail.trendTitle")}</h2>
          <ul className="trend-list">
            {company.financialSeries.map((value, index) => (
              <li key={`${company.id}-${index}`}>
                <span>{t("investmentDetail.trendPeriod", { index: index + 1 })}</span>
                <strong>{formatCurrency(value, locale)}</strong>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </main>
  );
}
