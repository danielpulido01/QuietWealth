import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../components/hooks/useSession";
import { routes } from "../../routes/routeConfig";

type SessionLike = {
  isAuthenticated?: boolean;
  session?: {
    isAuthenticated?: boolean;
  } | null;
};

function isAuthenticated(session: SessionLike): boolean {
  if (typeof session.isAuthenticated === "boolean") {
    return session.isAuthenticated;
  }

  if (typeof session.session?.isAuthenticated === "boolean") {
    return session.session.isAuthenticated;
  }

  return false;
}

type AuthGuardProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function AuthGuard({ children, redirectTo = routes.login }: AuthGuardProps) {
  const location = useLocation();
  const session = useSession() as SessionLike;

  if (!isAuthenticated(session)) {
    return <Navigate replace to={redirectTo} state={{ from: location }} />;
  }

  return <>{children}</>;
}
