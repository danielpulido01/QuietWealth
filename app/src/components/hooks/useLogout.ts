import { useState } from "react";
import { useSession } from "./useSession";
import { useApplicationServices } from "./useApplicationServices";

export function useLogout() {
  const { auth } = useApplicationServices();
  const { clearSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    try {
      await auth.logout();
    } finally {
      clearSession();
      setIsLoading(false);
    }
  }

  return { logout, isLoading };
}
