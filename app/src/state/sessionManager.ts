import { Permissions, isPermissionCode, type PermissionCode } from "../auth/policies/permissions";
import { rolePermissions } from "../auth/policies/rolePermissions";
import { Roles, isRoleCode, type RoleCode } from "../auth/policies/roles";
import { selectSession, sessionActions, sessionStore } from "./sessionStore";
import type { AuthSession, BackendSessionPayload } from "./session.types";
import { logger } from "../utils/logger";

type SessionListener = (session: AuthSession | null) => void;
type UnauthorizedListener = () => void;

type SessionManagerConfig = {
  loginPath?: string;
  redirectOnUnauthorized?: boolean;
};

class SessionManager {
  private static instance: SessionManager | null = null;
  private readonly unauthorizedListeners = new Set<UnauthorizedListener>();
  private loginPath = "/login";
  private redirectOnUnauthorized = true;

  static getInstance() {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }

    return SessionManager.instance;
  }

  private constructor() {}

  configure(config: SessionManagerConfig) {
    if (typeof config.loginPath === "string" && config.loginPath.trim().length > 0) {
      this.loginPath = config.loginPath.trim();
    }
    if (typeof config.redirectOnUnauthorized === "boolean") {
      this.redirectOnUnauthorized = config.redirectOnUnauthorized;
    }
  }

  getSession() {
    return selectSession(sessionStore.getState());
  }

  subscribe(listener: SessionListener) {
    listener(this.getSession());
    return sessionStore.subscribe(() => {
      listener(this.getSession());
    });
  }

  onUnauthorized(listener: UnauthorizedListener) {
    this.unauthorizedListeners.add(listener);
    return () => {
      this.unauthorizedListeners.delete(listener);
    };
  }

  setSession(payload: unknown) {
    const normalized = this.normalizeBackendSession(payload);
    sessionStore.dispatch(sessionActions.set(normalized));
    return normalized;
  }

  clearSession() {
    sessionStore.dispatch(sessionActions.clear());
  }

  async bootstrap(loadSession: () => Promise<unknown>) {
    try {
      const payload = await loadSession();
      return this.setSession(payload);
    } catch {
      this.clearSession();
      return null;
    }
  }

  handleUnauthorized() {
    this.clearSession();
    this.notifyUnauthorizedListeners();

    if (!this.redirectOnUnauthorized || typeof window === "undefined") {
      return;
    }

    const isAlreadyOnLogin = window.location.pathname === this.loginPath;
    if (!isAlreadyOnLogin) {
      logger.warn("Session expired. Redirecting to login.", { loginPath: this.loginPath });
      window.location.assign(this.loginPath);
    }
  }

  normalizeBackendSession(payload: unknown): AuthSession | null {
    if (!isRecord(payload)) {
      return null;
    }

    const backendPayload = payload as BackendSessionPayload;
    const userPayload = isRecord(backendPayload.user) ? backendPayload.user : null;

    const userId =
      asString(userPayload?.id)
      ?? asString(userPayload?.userId)
      ?? asString(userPayload?.appUserId)
      ?? asString(userPayload?.sub)
      ?? asString(backendPayload.userId)
      ?? asString(backendPayload.appUserId)
      ?? asString(backendPayload.id)
      ?? asString(backendPayload.sub);
    if (!userId) {
      return null;
    }

    const email = asNullableString(userPayload?.email ?? backendPayload.email);
    const isGlobalAdmin = asBoolean(userPayload?.isGlobalAdmin ?? backendPayload.isGlobalAdmin);

    const tenantRoleCandidates = asStringArray(userPayload?.tenantRoles ?? backendPayload.tenantRoles);
    const explicitRoleCandidates = asStringArray(userPayload?.roles ?? backendPayload.roles);

    const roles = new Set<RoleCode>();
    for (const role of explicitRoleCandidates) {
      if (isRoleCode(role)) {
        roles.add(role);
      }
    }
    for (const role of tenantRoleCandidates) {
      if (isRoleCode(role)) {
        roles.add(role);
      }
    }
    if (isGlobalAdmin) {
      roles.add(Roles.SUPER_ADMIN);
    }

    const permissions = new Set<PermissionCode>();
    const explicitPermissions = asStringArray(userPayload?.permissions ?? backendPayload.permissions);
    for (const permission of explicitPermissions) {
      if (isPermissionCode(permission)) {
        permissions.add(permission);
      }
    }

    for (const role of roles) {
      const mappedPermissions = rolePermissions[role] ?? [];
      for (const permission of mappedPermissions) {
        if (permission === "*") {
          for (const allPermission of Object.values(Permissions)) {
            permissions.add(allPermission);
          }
        } else if (isPermissionCode(permission)) {
          permissions.add(permission);
        }
      }
    }

    const tenantRoles = tenantRoleCandidates.filter(isRoleCode);
    const tenantIds = asStringArray(userPayload?.tenantIds ?? backendPayload.tenantIds);
    const isAuthenticated = asBoolean(backendPayload.isAuthenticated, true);

    return {
      user: {
        id: userId,
        email,
        isGlobalAdmin,
        tenantIds,
        tenantRoles,
      },
      roles: [...roles],
      permissions: [...permissions],
      isAuthenticated,
    };
  }

  private notifyUnauthorizedListeners() {
    for (const listener of this.unauthorizedListeners) {
      listener();
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNullableString(value: unknown) {
  return asString(value);
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function asBoolean(value: unknown, defaultValue = false) {
  return typeof value === "boolean" ? value : defaultValue;
}

export const sessionManager = SessionManager.getInstance();
