import { useEffect, useState } from "react";
import { localMvpService } from "../../services/localMvpService";
import type { SmeProfile } from "../../models/local-mvp";
import type { MarketplaceFilterState } from "../molecules/MarketplaceFilters";

export function useMarketplace(filters: MarketplaceFilterState) {
  const [companies, setCompanies] = useState<SmeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    void localMvpService
      .getMarketplace({
        search: filters.search,
        sector: filters.sector,
        certificationStatus: filters.certificationStatus,
        trustLevel: filters.trustLevel,
      })
      .then((nextCompanies) => {
        if (isActive) {
          setCompanies(nextCompanies);
        }
      })
      .catch(() => {
        if (isActive) {
          setError("marketplace.errors.load");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [filters.certificationStatus, filters.search, filters.sector, filters.trustLevel]);

  return { companies, isLoading, error };
}
