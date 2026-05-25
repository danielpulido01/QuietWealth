import type { PermissionCode } from "../auth/policies/permissions";
import type { RoleCode } from "../auth/policies/roles";

export type AuthUser = {
  id: string;
  email: string | null;
  isGlobalAdmin: boolean;
  tenantIds: string[];
  tenantRoles: RoleCode[];
};

export type AuthSession = {
  user: AuthUser;
  roles: RoleCode[];
  permissions: PermissionCode[];
  isAuthenticated: boolean;
};

export type BackendSessionPayload = {
  userId?: unknown;
  appUserId?: unknown;
  id?: unknown;
  sub?: unknown;
  email?: unknown;
  isGlobalAdmin?: unknown;
  tenantIds?: unknown;
  tenantRoles?: unknown;
  roles?: unknown;
  permissions?: unknown;
  isAuthenticated?: unknown;
  user?: {
    id?: unknown;
    userId?: unknown;
    appUserId?: unknown;
    sub?: unknown;
    email?: unknown;
    isGlobalAdmin?: unknown;
    tenantIds?: unknown;
    tenantRoles?: unknown;
    roles?: unknown;
    permissions?: unknown;
  };
};
