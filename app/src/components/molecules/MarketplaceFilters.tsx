import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { useTranslation } from "react-i18next";

export type MarketplaceFilterState = {
  search: string;
  sector: string;
  certificationStatus: string;
  trustLevel: string;
};

type MarketplaceFiltersProps = {
  value: MarketplaceFilterState;
  onChange: (next: MarketplaceFilterState) => void;
};

export function MarketplaceFilters({ value, onChange }: MarketplaceFiltersProps) {
  const { t } = useTranslation();

  return (
    <section className="filter-bar" aria-labelledby="marketplace-filters-title">
      <div className="sr-only" id="marketplace-filters-title">
        {t("marketplace.filters.title")}
      </div>

      <label className="field">
        <span className="sr-only">{t("marketplace.filters.searchLabel")}</span>
        <Input
          name="marketplace-search"
          autoComplete="off"
          placeholder={t("marketplace.filters.searchPlaceholder")}
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
      </label>

      <label className="field">
        <span className="sr-only">{t("marketplace.filters.sectorLabel")}</span>
        <Select
          name="marketplace-sector"
          value={value.sector}
          onChange={(event) => onChange({ ...value, sector: event.target.value })}
        >
          <option value="">{t("marketplace.filters.allSectors")}</option>
          <option value="Technology">{t("sectors.Technology")}</option>
          <option value="Energy">{t("sectors.Energy")}</option>
          <option value="Commerce">{t("sectors.Commerce")}</option>
        </Select>
      </label>

      <label className="field">
        <span className="sr-only">{t("marketplace.filters.statusLabel")}</span>
        <Select
          name="marketplace-status"
          value={value.certificationStatus}
          onChange={(event) => onChange({ ...value, certificationStatus: event.target.value })}
        >
          <option value="">{t("marketplace.filters.allStatuses")}</option>
          <option value="Certified">{t("status.Certified")}</option>
          <option value="UnderReview">{t("status.UnderReview")}</option>
          <option value="Rejected">{t("status.Rejected")}</option>
        </Select>
      </label>

      <label className="field">
        <span className="sr-only">{t("marketplace.filters.trustLabel")}</span>
        <Select
          name="marketplace-trust"
          value={value.trustLevel}
          onChange={(event) => onChange({ ...value, trustLevel: event.target.value })}
        >
          <option value="">{t("marketplace.filters.allTrust")}</option>
          <option value="80">{t("marketplace.filters.trustHigh")}</option>
          <option value="60">{t("marketplace.filters.trustMid")}</option>
        </Select>
      </label>
    </section>
  );
}
