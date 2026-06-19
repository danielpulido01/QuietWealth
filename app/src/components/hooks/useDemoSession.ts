import { useState } from "react";
import { localMvpService } from "../../services/localMvpService";
import type { UserRole } from "../../models/local-mvp";

export function useDemoSession() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(nextRole: UserRole) {
    setError(null);
    setIsAuthenticating(true);

    try {
      await localMvpService.login(nextRole);
      setRole(nextRole);
      return true;
    } catch {
      setError("login.localError");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function logout() {
    setIsLoggingOut(true);

    try {
      await localMvpService.logout();
    } finally {
      setRole(null);
      setIsLoggingOut(false);
    }
  }

  return {
    role,
    isAuthenticating,
    isLoggingOut,
    error,
    login,
    logout,
  };
}
