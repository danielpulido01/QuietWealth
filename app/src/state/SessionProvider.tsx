import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthServiceError, NoTenantAccessError, authService } from "../auth/authService";
import type { AuthSession, AuthUser } from "./session.types";
import type { PermissionCode } from "../auth/policies/permissions";
import type { RoleCode } from "../auth/policies/roles";
import { sessionManager } from "./sessionManager";

type SessionState = AuthSession | null;

export type SessionContextValue = {
  session: SessionState;
  user: AuthUser | null;
  roles: RoleCode[];
  permissions: PermissionCode[];
  isAuthenticated: boolean;
  isLoading: boolean;
  noTenantAccess: boolean;
  setSession: (nextSession: AuthSession) => void;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionState>(() => sessionManager.getSession());
  const [isLoading, setIsLoading] = useState(true);
  const [noTenantAccess, setNoTenantAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe(setSessionState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    sessionManager.configure({
      loginPath: "/",
      redirectOnUnauthorized: true,
    });
  }, []);

  const setSession = useCallback((nextSession: AuthSession) => {
    setNoTenantAccess(false);
    sessionManager.setSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    setNoTenantAccess(false);
    sessionManager.clearSession();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setNoTenantAccess(false);
      await authService.getCurrentSession();
    } catch (error) {
      if (error instanceof NoTenantAccessError) {
        setNoTenantAccess(true);
        sessionManager.clearSession();
        return;
      }

      sessionManager.clearSession();
      if (!(error instanceof AuthServiceError)) {
        return;
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        setNoTenantAccess(false);
        await authService.getCurrentSession();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof NoTenantAccessError) {
          setNoTenantAccess(true);
          sessionManager.clearSession();
          return;
        }

        sessionManager.clearSession();
        if (!(error instanceof AuthServiceError)) {
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      roles: session?.roles ?? [],
      permissions: session?.permissions ?? [],
      isAuthenticated: session?.isAuthenticated ?? false,
      isLoading,
      noTenantAccess,
      setSession,
      clearSession,
      refreshSession,
    }),
    [session, isLoading, noTenantAccess, setSession, clearSession, refreshSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
