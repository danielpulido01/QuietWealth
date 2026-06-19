import { useCallback, useEffect, useState } from "react";
import { localMvpService } from "../../services/localMvpService";
import type { ValidationRequest } from "../../models/local-mvp";

export function useValidationRequests() {
  const [requests, setRequests] = useState<ValidationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextRequests = await localMvpService.getValidationRequests();
      setRequests(nextRequests);
    } catch {
      setError("validation.errors.load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    requests,
    isLoading,
    error,
    reload,
  };
}
