import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
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

type GuestGuardProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function GuestGuard({ children, redirectTo = routes.home }: GuestGuardProps) {
  const session = useSession() as SessionLike;

  if (isAuthenticated(session)) {
    return <Navigate replace to={redirectTo} />;
  }

  return <>{children}</>;
}
