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
          <div className="detail-hero__project-summary"><span>Sobre el proyecto</span><p>{company.description}</p></div>
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

      <section className="detail-analytics">
        <h2>Indicadores de crecimiento verificados</h2>
        <div className="detail-chart-grid">
          <Surface className="detail-chart-card"><h3>Crecimiento de ingresos</h3><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path className="chart-area--green" d="M0,42 C15,38 29,35 42,31 S69,19 100,5 L100,50 L0,50Z"/><path className="chart-line chart-line--green" d="M0,42 C15,38 29,35 42,31 S69,19 100,5"/></svg><small>Ingresos mensuales verificados</small></Surface>
          <Surface className="detail-chart-card"><h3>Crecimiento de inversionistas</h3><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path className="chart-area--blue" d="M0,45 C18,40 35,35 52,27 S80,15 100,5 L100,50 L0,50Z"/><path className="chart-line chart-line--blue" d="M0,45 C18,40 35,35 52,27 S80,15 100,5"/></svg><small>Participación de inversionistas activos</small></Surface>
        </div>
        <Surface className="detail-chart-card detail-chart-card--capital"><h3>Capital acumulado en el tiempo</h3><svg viewBox="0 0 100 45" preserveAspectRatio="none"><path className="chart-area--navy" d="M0,42 C17,36 34,32 50,26 S76,10 100,4 L100,45 L0,45Z"/><path className="chart-line chart-line--navy" d="M0,42 C17,36 34,32 50,26 S76,10 100,4"/></svg><small>Capital acumulado de inversión (USD)</small></Surface>
      </section>
      <div className="detail-grid detail-grid--rich">
        <Surface className="detail-copy"><h2>Descripción de la empresa</h2><p>{company.description}</p><p>Este perfil reúne evidencia financiera estandarizada y documentación validada por expertos para facilitar decisiones de inversión informadas.</p></Surface>
        <Surface className="detail-copy"><h2>Métricas clave</h2><dl className="definition-list"><div><dt>{t("investmentDetail.highlights.trust")}</dt><dd>{t("marketplace.card.trustValue", { value: company.trustLevel })}</dd></div><div><dt>{t("investmentDetail.highlights.retention")}</dt><dd>{formatPercent(company.retentionRate, locale)}</dd></div><div><dt>{t("investmentDetail.highlights.mrr")}</dt><dd>{formatCurrency(company.mrr, locale)}</dd></div><div><dt>{t("investmentDetail.highlights.margin")}</dt><dd>{formatPercent(company.profitMargin, locale)}</dd></div></dl></Surface>
      </div>    </main>
  );
}



