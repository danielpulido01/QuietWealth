import { useEffect, useState } from "react";
import { localMvpService } from "../../services/localMvpService";
import type { SmeProfile } from "../../models/local-mvp";

export function useSmeDetail(id: string | undefined) {
  const [company, setCompany] = useState<SmeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCompany(null);
      setIsLoading(false);
      setError("common.errors.notFound");
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    void localMvpService
      .getSme(id)
      .then((nextCompany) => {
        if (isActive) {
          setCompany(nextCompany);
        }
      })
      .catch(() => {
        if (isActive) {
          setError("common.errors.loadDetail");
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
  }, [id]);

  return { company, isLoading, error };
}
