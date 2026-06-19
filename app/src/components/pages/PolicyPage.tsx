import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Surface } from "../atoms/Surface";

type PolicyPageProps = {
  kind: "terms" | "privacy";
};

export function PolicyPage({ kind }: PolicyPageProps) {
  const { t } = useTranslation();

  return (
    <main className="feedback-page">
      <Surface className="feedback-card">
        <p className="eyebrow">{t(`policies.${kind}.eyebrow`)}</p>
        <h1>{t(`policies.${kind}.title`)}</h1>
        <p>{t(`policies.${kind}.body`)}</p>
        <Link className="card-link card-link--inline" to="/login">
          {t("policies.back")}
        </Link>
      </Surface>
    </main>
  );
}
