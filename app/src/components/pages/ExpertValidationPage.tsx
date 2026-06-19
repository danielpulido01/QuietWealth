import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";
import { StatusBadge } from "../atoms/StatusBadge";
import { Surface } from "../atoms/Surface";
import { ValidationDialog } from "../molecules/ValidationDialog";
import { useValidationRequests } from "../hooks/useValidationRequests";
import { localMvpService } from "../../services/localMvpService";

export function ExpertValidationPage() {
  const { t } = useTranslation();
  const { requests, isLoading, error, reload } = useValidationRequests();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const selectedRequest = requests.find((request) => request.id === selectedId) ?? null;

  async function handleApprove() {
    if (!selectedRequest) {
      return;
    }

    await localMvpService.approveRequest(selectedRequest.id);
    setSelectedId(null);
    setReason("");
    await reload();
  }

  async function handleReject() {
    if (!selectedRequest) {
      return;
    }

    await localMvpService.rejectRequest(
      selectedRequest.id,
      reason || t("validation.dialog.defaultReason"),
    );
    setSelectedId(null);
    setReason("");
    await reload();
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">{t("validation.eyebrow")}</p>
        <h1>{t("validation.title")}</h1>
        <p>{t("validation.subtitle")}</p>
      </header>

      {error ? <p className="inline-message">{t(error)}</p> : null}
      {isLoading ? <p className="inline-message">{t("common.status.loading")}</p> : null}

      {!isLoading && !error ? (
        requests.length ? (
          <div className="review-list">
            {requests.map((request) => (
              <Surface className="review-row" key={request.id}>
                <div>
                  <p className="eyebrow">{t("validation.row.requestId", { id: request.id })}</p>
                  <h2>{request.company}</h2>
                </div>
                <p>{t(`sectors.${request.sector}`)}</p>
                <StatusBadge status={request.status} />
                <Button variant="secondary" onClick={() => setSelectedId(request.id)}>
                  {t("validation.actions.review")}
                </Button>
              </Surface>
            ))}
          </div>
        ) : (
          <section className="empty-state">
            <h2>{t("validation.empty.title")}</h2>
            <p>{t("validation.empty.description")}</p>
          </section>
        )
      ) : null}

      {selectedRequest ? (
        <ValidationDialog
          request={selectedRequest}
          reason={reason}
          onReasonChange={setReason}
          onClose={() => setSelectedId(null)}
          onApprove={() => void handleApprove()}
          onReject={() => void handleReject()}
          documentUrlFor={localMvpService.buildDocumentUrl}
        />
      ) : null}
    </main>
  );
}
