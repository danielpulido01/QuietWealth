import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { Surface } from "../atoms/Surface";
import { CertificationSteps } from "../molecules/CertificationSteps";
import { StatusBadge } from "../atoms/StatusBadge";
import { useValidationRequests } from "../hooks/useValidationRequests";
import { useI18n } from "../i18n/I18nProvider";
import { localMvpService } from "../../services/localMvpService";
import { formatDate } from "../../utils/formatters";

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
]);

const DEMO_SME_ID = "00000000-0000-0000-0000-000000000004";

export function DocumentUploadPage() {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { requests, isLoading, error, reload } = useValidationRequests();
  const [files, setFiles] = useState<FileList | null>(null);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const history = useMemo(
    () => requests.filter((request) => request.smeId === DEMO_SME_ID),
    [requests],
  );

  async function handleSubmit() {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) {
      setMessageKey("documents.feedback.selectOne");
      return;
    }

    if (selectedFiles.some((file) => !allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024)) {
      setMessageKey("documents.feedback.invalid");
      return;
    }

    setIsSubmitting(true);
    setMessageKey(null);

    try {
      for (const file of selectedFiles) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });

        await localMvpService.uploadDocument({
          smeId: DEMO_SME_ID,
          fileName: file.name,
          size: file.size,
          contentType: file.type,
          dataUrl,
        });
      }

      setMessageKey("documents.feedback.success");
      setFiles(null);
      await reload();
    } catch {
      setMessageKey("documents.feedback.error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">{t("documents.eyebrow")}</p>
        <h1>{t("documents.title")}</h1>
        <p>{t("documents.subtitle")}</p>
      </header>

      <Surface className="upload-shell">
        <CertificationSteps />

        <label className="upload-dropzone" htmlFor="document-upload-input">
          <span className="upload-dropzone__icon">{t("documents.dropzone.icon")}</span>
          <strong>{t("documents.dropzone.title")}</strong>
          <span>{t("documents.dropzone.subtitle")}</span>
          <span className="upload-dropzone__cta">{t("documents.dropzone.cta")}</span>
          <small>{t("documents.dropzone.footnote")}</small>
        </label>
        <input
          id="document-upload-input"
          className="sr-only"
          type="file"
          name="documents"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(event) => setFiles(event.target.files)}
        />

        {files?.length ? (
          <p className="inline-message" aria-live="polite">
            {Array.from(files)
              .map((file) => file.name)
              .join(", ")}
          </p>
        ) : null}

        <Button block size="lg" variant="success" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? t("documents.submit.loading") : t("documents.submit.default")}
        </Button>

        {messageKey ? (
          <p className="inline-message" aria-live="polite">
            {t(messageKey)}
          </p>
        ) : null}
      </Surface>

      <section className="history-section">
        <h2>{t("documents.history.title")}</h2>
        {error ? <p className="inline-message">{t(error)}</p> : null}
        {isLoading ? <p className="inline-message">{t("common.status.loading")}</p> : null}

        {!isLoading && !error ? (
          history.length ? (
            <div className="history-list">
              {history.map((request) => (
                <Surface className="history-row" key={request.id}>
                  <div>
                    <p className="history-row__label">{t("documents.history.submitted")}</p>
                    <strong>{formatDate(request.submittedAt, locale)}</strong>
                  </div>
                  <div>
                    <p className="history-row__label">{t("documents.history.documents")}</p>
                    <strong>{request.documents.join(", ")}</strong>
                  </div>
                  <div>
                    <p className="history-row__label">{t("documents.history.status")}</p>
                    <StatusBadge status={request.status} />
                  </div>
                  <div>
                    <p className="history-row__label">{t("documents.history.note")}</p>
                    <strong>{request.reason || t("documents.history.pending")}</strong>
                  </div>
                </Surface>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <h2>{t("documents.empty.title")}</h2>
              <p>{t("documents.empty.description")}</p>
            </section>
          )
        ) : null}
      </section>
    </main>
  );
}
