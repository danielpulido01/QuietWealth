import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Surface } from "../atoms/Surface";
import { useSmeDetail } from "../hooks/useSmeDetail";
import { useI18n } from "../i18n/I18nProvider";
import { formatPercent } from "../../utils/formatters";

const investmentOptions = ["equity", "convertible", "revenue"] as const;
const paymentOptions = ["wire", "swift", "stablecoin"] as const;

export function InvestmentRequestPage() {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { id } = useParams();
  const { company, isLoading, error } = useSmeDetail(id);
  const [amount, setAmount] = useState("");
  const [instrument, setInstrument] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return <main className="page inline-message">{t("common.status.loading")}</main>;
  }

  if (!company || error) {
    return <main className="page inline-message">{t(error ?? "common.errors.notFound")}</main>;
  }

  const canSubmit =
    Number(amount) >= 500 &&
    instrument.length > 0 &&
    paymentMethod.length > 0 &&
    acceptedTerms &&
    acceptedRisk;

  if (submitted) {
    return (
      <main className="page page--narrow">
        <Surface className="success-card">
          <p className="eyebrow">{t("investmentForm.success.eyebrow")}</p>
          <h1>{t("investmentForm.success.title")}</h1>
          <p>{t("investmentForm.success.description", { company: company.name })}</p>
          <Link className="card-link card-link--inline" to="/marketplace">
            {t("investmentForm.success.back")}
          </Link>
        </Surface>
      </main>
    );
  }

  return (
    <main className="page page--narrow">
      <Link className="back-link" to={`/marketplace/${company.id}`}>
        {t("investmentForm.back")}
      </Link>

      <header className="page-header">
        <p className="eyebrow">{t("investmentForm.eyebrow")}</p>
        <h1>{t("investmentForm.title")}</h1>
        <p>{t("investmentForm.subtitle")}</p>
      </header>

      <Surface className="summary-row">
        <div>
          <p className="eyebrow">{t("investmentForm.summary.company")}</p>
          <h2>{company.name}</h2>
          <p>{t(`sectors.${company.sector}`)}</p>
        </div>
        <strong>{t("investmentForm.summary.roi", { value: formatPercent(company.averageRoi, locale) })}</strong>
      </Surface>

      <Surface className="form-section">
        <label className="field" htmlFor="investment-amount">
          <span>{t("investmentForm.amount.label")}</span>
          <Input
            id="investment-amount"
            name="investmentAmount"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("investmentForm.amount.placeholder")}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <p className="helper-copy">{t("investmentForm.amount.helper")}</p>
        <div className="investment-amount-presets" aria-label="Montos sugeridos">
          {[5000, 10000, 25000, 50000, 100000].map((preset) => (
            <Button key={preset} variant="ghost" size="sm" onClick={() => setAmount(String(preset))}>
              ${preset.toLocaleString()}
            </Button>
          ))}
        </div>
      </Surface>

      <Surface className="form-section">
        <h2>{t("investmentForm.instrument.title")}</h2>
        <div className="choice-list">
          {investmentOptions.map((option) => (
            <Button
              key={option}
              variant={instrument === option ? "success" : "ghost"}
              className="choice-button"
              aria-pressed={instrument === option}
              onClick={() => setInstrument(option)}
            >
              <span className="choice-button__title">
                {t(`investmentForm.instrument.options.${option}.title`)}
              </span>
              <span className="choice-button__description">
                {t(`investmentForm.instrument.options.${option}.description`)}
              </span>
            </Button>
          ))}
        </div>
      </Surface>

      <Surface className="form-section">
        <h2>{t("investmentForm.payment.title")}</h2>
        <div className="choice-list">
          {paymentOptions.map((option) => (
            <Button
              key={option}
              variant={paymentMethod === option ? "secondary" : "ghost"}
              className="choice-button"
              aria-pressed={paymentMethod === option}
              onClick={() => setPaymentMethod(option)}
            >
              <span className="choice-button__title">
                {t(`investmentForm.payment.options.${option}.title`)}
              </span>
              <span className="choice-button__description">
                {t(`investmentForm.payment.options.${option}.description`)}
              </span>
            </Button>
          ))}
        </div>
      </Surface>

      <Surface className="form-section">
        <h2>{t("investmentForm.legal.title")}</h2>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>{t("investmentForm.legal.terms")}</span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="acceptRisk"
            checked={acceptedRisk}
            onChange={(event) => setAcceptedRisk(event.target.checked)}
          />
          <span>{t("investmentForm.legal.risk")}</span>
        </label>
      </Surface>

      <Button block size="lg" onClick={() => setSubmitted(true)} disabled={!canSubmit}>
        {t("investmentForm.submit")}
      </Button>

      <p className="helper-copy helper-copy--center">{t("investmentForm.note")}</p>
    </main>
  );
}

