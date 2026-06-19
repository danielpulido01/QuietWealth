import { useTranslation } from "react-i18next";
import type { CertificationStatus } from "../../models/local-mvp";

export function StatusBadge({ status }: { status: CertificationStatus }) {
  const { t } = useTranslation();

  return (
    <span className={`status-badge status-badge--${status}`}>
      {t(`status.${status}`)}
    </span>
  );
}
