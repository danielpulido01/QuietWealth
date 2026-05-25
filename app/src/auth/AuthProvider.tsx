import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, authFetch, buildApiUrl } from "../services/client";
import {
  authUserSchema,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  resetPasswordRequestSchema,
} from "./auth-schemas";
import { parseWithSchema } from "../utils/schemaValidator";

type User = {
  userId: string | null;
  displayName: string | null;
  email: string | null;
  isGlobalAdmin: boolean;
  tenantIds: string[];
  tenantRoles: string[];
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  noTenantAccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (accessToken: string, refreshToken: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readErrorMessage(response: Response) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      if (typeof body?.message === "string") return body.message;
      if (typeof body?.error === "string") return body.error;
      return JSON.stringify(body);
    }
    return await response.text();
  } catch {
    return "Request failed.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noTenantAccess, setNoTenantAccess] = useState(false);

  const loadMe = useCallback(async () => {
    const response = await authFetch("/api/auth/me");
    if (!response.ok) {
      if (response.status === 403) {
        setNoTenantAccess(true);
      } else {
        setNoTenantAccess(false);
      }
      setUser(null);
      return false;
    }
    setNoTenantAccess(false);
    const payload = await response.json();
    const data = parseWithSchema(authUserSchema, payload, {
      schemaName: "auth me response",
      context: {
        scope: "auth",
        request: {
          method: "GET",
          url: "/api/auth/me",
          status: response.status,
        },
      },
    });
    if (!data.userId) {
      console.warn("Authenticated response did not contain userId. Logging out.");
      setUser(null);
      return false;
    }

    setUser(data);
    return true;
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!isMounted) return;
        await loadMe();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const payload = parseWithSchema(
          loginRequestSchema,
          { email, password },
          {
            schemaName: "login request",
            context: { scope: "auth" },
          },
        );

        const response = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }
        setNoTenantAccess(false);
        await loadMe();
      } finally {
        setIsLoading(false);
      }
    },
    [loadMe],
  );

  const loginWithMicrosoft = useCallback(() => {
    setIsLoading(true);

    const returnUrl = `${window.location.origin}${window.location.pathname}`;
    const loginUrl = new URL(buildApiUrl("/api/auth/microsoft/login"), window.location.origin);
    loginUrl.searchParams.set("returnUrl", returnUrl);

    window.location.assign(loginUrl.toString());
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setNoTenantAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const payload = parseWithSchema(
        forgotPasswordRequestSchema,
        { email, redirectTo },
        {
          schemaName: "forgot password request",
          context: { scope: "auth" },
        },
      );

      const response = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (accessToken: string, refreshToken: string, newPassword: string) => {
      setIsLoading(true);
      try {
        const payload = parseWithSchema(
          resetPasswordRequestSchema,
          {
            accessToken,
            refreshToken,
            newPassword,
          },
          {
            schemaName: "reset password request",
            context: { scope: "auth" },
          },
        );

        const response = await apiFetch("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        await loadMe();
      } finally {
        setIsLoading(false);
      }
    },
    [loadMe],
  );

  const refresh = useCallback(async () => {
    const response = await apiFetch("/api/auth/refresh", { method: "POST" });
    if (!response.ok) {
      return false;
    }
    await loadMe();
    return true;
  }, [loadMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user?.userId),
      noTenantAccess,
      login,
      loginWithMicrosoft,
      requestPasswordReset,
      resetPassword,
      logout,
      refresh,
    }),
    [user, isLoading, noTenantAccess, login, requestPasswordReset, resetPassword, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
