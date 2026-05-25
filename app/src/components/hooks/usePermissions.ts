import { useMemo } from "react";
import { Permissions, type PermissionCode } from "../../auth/policies/permissions";
import { rolePermissions } from "../../auth/policies/rolePermissions";
import { useSession } from "./useSession";

export const usePermissions = () => {
  const { permissions: sessionPermissions, roles } = useSession();

  const permissions = useMemo(() => {
    const resolved = new Set<PermissionCode>();

    for (const permission of sessionPermissions) {
      resolved.add(permission);
    }

    for (const role of roles) {
      const mappedPermissions = rolePermissions[role] ?? [];
      for (const permission of mappedPermissions) {
        if (permission === "*") {
          for (const fullPermission of Object.values(Permissions)) {
            resolved.add(fullPermission);
          }
        } else {
          resolved.add(permission);
        }
      }
    }

    return [...resolved];
  }, [sessionPermissions, roles]);

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const hasPermission = (permission: PermissionCode): boolean => {
    return permissionSet.has(permission);
  };

  const hasAllPermissions = (requiredPermissions: readonly PermissionCode[]): boolean => {
    if (requiredPermissions.length === 0) {
      return true;
    }
    return requiredPermissions.every((permission) => permissionSet.has(permission));
  };

  const hasAnyPermission = (requiredPermissions: readonly PermissionCode[]): boolean => {
    if (requiredPermissions.length === 0) {
      return false;
    }
    return requiredPermissions.some((permission) => permissionSet.has(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};
