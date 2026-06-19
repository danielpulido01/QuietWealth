import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { StatusBadge } from "../atoms/StatusBadge";
import { Surface } from "../atoms/Surface";
import { TextArea } from "../atoms/TextArea";
import { useI18n } from "../i18n/I18nProvider";
import { formatDate } from "../../utils/formatters";
import type { ValidationRequest } from "../../models/local-mvp";

type ValidationDialogProps = {
  request: ValidationRequest;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  documentUrlFor: (fileName: string) => string;
};

export function ValidationDialog({
  request,
  reason,
  onReasonChange,
  onClose,
  onApprove,
  onReject,
  documentUrlFor,
}: ValidationDialogProps) {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <Surface
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-panel__header">
          <div>
            <p className="eyebrow">{t("validation.dialog.eyebrow", { id: request.id })}</p>
            <h2 id={titleId}>{request.company}</h2>
            <p>
              {t(`sectors.${request.sector}`)} • {formatDate(request.submittedAt, locale)}
            </p>
          </div>
          <div className="dialog-panel__actions">
            <StatusBadge status={request.status} />
            <Button ref={closeButtonRef} variant="ghost" onClick={onClose}>
              {t("common.actions.close")}
            </Button>
          </div>
        </div>

        <div className="dialog-panel__body">
          <div>
            <h3>{t("validation.dialog.documentsTitle")}</h3>
            <ul className="document-link-list">
              {request.documents.map((document) => (
                <li key={document}>
                  <a href={documentUrlFor(document)} target="_blank" rel="noreferrer">
                    {t("validation.dialog.openDocument", { document })}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {request.status === "UnderReview" ? (
            <label className="field">
              <span>{t("validation.dialog.reasonLabel")}</span>
              <TextArea
                name="review-reason"
                placeholder={t("validation.dialog.reasonPlaceholder")}
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
              />
            </label>
          ) : (
            <Surface className="decision-summary">
              <p className="eyebrow">{t("validation.dialog.finalDecision")}</p>
              <p>{request.reason || t("validation.dialog.noReason")}</p>
            </Surface>
          )}
        </div>

        {request.status === "UnderReview" ? (
          <div className="dialog-panel__footer">
            <Button variant="success" onClick={onApprove}>
              {t("validation.actions.approve")}
            </Button>
            <Button variant="danger" onClick={onReject}>
              {t("validation.actions.reject")}
            </Button>
          </div>
        ) : null}
      </Surface>
    </div>
  );
}
