import { useState } from "react";
import { useSession } from "./useSession";
import { useApplicationServices } from "./useApplicationServices";

type LoginInput = {
  email: string;
  password: string;
};

export function useLogin() {
  const { auth } = useApplicationServices();
  const { setSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(input: LoginInput) {
    setError(null);
    setIsLoading(true);

    try {
      const session = await auth.login(input);
      if (!session) {
        setError("No active session was returned by the server.");
        return false;
      }

      setSession(session);
      return true;
    } catch (reason) {
      if (auth.isNoTenantAccessError(reason)) {
        setError("Your account has no assigned tenant access.");
        return false;
      }

      if (auth.isAuthServiceError(reason)) {
        setError(auth.toErrorMessage(reason, "Login failed."));
        return false;
      }

      setError(auth.toErrorMessage(reason, "Login failed."));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
