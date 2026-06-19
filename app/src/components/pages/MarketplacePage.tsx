import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MarketplaceFilters, type MarketplaceFilterState } from "../molecules/MarketplaceFilters";
import { SmeCard } from "../molecules/SmeCard";
import { useMarketplace } from "../hooks/useMarketplace";

const defaultFilters: MarketplaceFilterState = {
  search: "",
  sector: "",
  certificationStatus: "",
  trustLevel: "",
};

export function MarketplacePage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<MarketplaceFilterState>(defaultFilters);
  const { companies, isLoading, error } = useMarketplace(filters);

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">{t("marketplace.eyebrow")}</p>
        <h1>{t("marketplace.title")}</h1>
        <p>{t("marketplace.subtitle")}</p>
      </header>

      <MarketplaceFilters value={filters} onChange={setFilters} />

      {error ? <p className="inline-message">{t(error)}</p> : null}
      {isLoading ? <p className="inline-message">{t("common.status.loading")}</p> : null}

      {!isLoading && !error ? (
        companies.length ? (
          <div className="card-grid">
            {companies.map((company) => (
              <SmeCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <section className="empty-state">
            <h2>{t("marketplace.empty.title")}</h2>
            <p>{t("marketplace.empty.description")}</p>
          </section>
        )
      ) : null}
    </main>
  );
}
