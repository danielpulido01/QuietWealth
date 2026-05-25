import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../components/hooks/usePermissions";
import { routes } from "../../routes/routeConfig";

type PolicyGuardProps = {
  children: ReactNode;
  required: string[];
  mode?: "all" | "any";
  fallback?: ReactNode;
  redirectTo?: string;
};

export function PolicyGuard({
  children,
  required,
  mode = "all",
  fallback = null,
  redirectTo = routes.home,
}: PolicyGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = required.length === 0
    ? true
    : mode === "all"
      ? hasAllPermissions(required)
      : hasAnyPermission(required);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <Navigate replace to={redirectTo} />;
  }

  return <>{children}</>;
}
