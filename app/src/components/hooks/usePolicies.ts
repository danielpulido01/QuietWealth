import { accessPolicy, type AccessPolicyName } from "../../auth/policies/accessPolicy";
import { usePermissions } from "./usePermissions";

export const usePolicies = () => {
  const { permissions, hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = (policyName: AccessPolicyName): boolean => {
    const requiredPermissions = accessPolicy[policyName] ?? [];
    return hasAllPermissions(requiredPermissions);
  };

  const hasSomeAccess = (policyName: AccessPolicyName): boolean => {
    const requiredPermissions = accessPolicy[policyName] ?? [];
    return hasAnyPermission(requiredPermissions);
  };

  const getMissingPermissions = (policyName: AccessPolicyName): string[] => {
    const requiredPermissions = accessPolicy[policyName] ?? [];
    return requiredPermissions.filter((permission) => !permissions.includes(permission));
  };

  return {
    policies: accessPolicy,
    permissions,
    hasAccess,
    hasSomeAccess,
    getMissingPermissions,
    hasAllPermissions,
    hasAnyPermission,
  };
};
