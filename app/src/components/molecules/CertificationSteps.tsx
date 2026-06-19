import { useTranslation } from "react-i18next";

export function CertificationSteps() {
  const { t } = useTranslation();

  return (
    <ol className="progress-steps" aria-label={t("documents.progress.label")}>
      <li className="progress-steps__item progress-steps__item--active">
        <span className="progress-steps__icon">1</span>
        <span>{t("documents.progress.uploaded")}</span>
      </li>
      <li className="progress-steps__divider" aria-hidden="true" />
      <li className="progress-steps__item">
        <span className="progress-steps__icon">2</span>
        <span>{t("documents.progress.review")}</span>
      </li>
      <li className="progress-steps__divider" aria-hidden="true" />
      <li className="progress-steps__item">
        <span className="progress-steps__icon">3</span>
        <span>{t("documents.progress.certified")}</span>
      </li>
    </ol>
  );
}
