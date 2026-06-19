import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoginPage } from "../components/pages/LoginPage";
import { MarketplacePage } from "../components/pages/MarketplacePage";
import { InvestmentDetailPage } from "../components/pages/InvestmentDetailPage";
import { InvestmentRequestPage } from "../components/pages/InvestmentRequestPage";
import { DocumentUploadPage } from "../components/pages/DocumentUploadPage";
import { ExpertValidationPage } from "../components/pages/ExpertValidationPage";
import { PolicyPage } from "../components/pages/PolicyPage";
import { AppShell } from "../components/templates/AppShell";
import { useDemoSession } from "../components/hooks/useDemoSession";
import type { UserRole } from "../models/local-mvp";
import { routes } from "./routeConfig";

const defaultRouteByRole: Record<UserRole, string> = {
  Investor: routes.marketplace,
  SME: routes.documents,
  Expert: routes.validation,
};

function ProtectedLayout({
  role,
  onLogout,
  isLoggingOut,
}: {
  role: UserRole | null;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  if (!role) {
    return <Navigate to={routes.login} replace />;
  }

  return (
    <AppShell role={role} onLogout={onLogout} isLoggingOut={isLoggingOut}>
      <Outlet />
    </AppShell>
  );
}

function RoleRoute({
  currentRole,
  allowedRole,
  children,
}: {
  currentRole: UserRole | null;
  allowedRole: UserRole;
  children: React.JSX.Element;
}) {
  if (!currentRole) {
    return <Navigate to={routes.login} replace />;
  }

  if (currentRole !== allowedRole) {
    return <Navigate to={defaultRouteByRole[currentRole]} replace />;
  }

  return children;
}

export function AppRouter() {
  const session = useDemoSession();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={session.role ? defaultRouteByRole[session.role] : routes.login}
            replace
          />
        }
      />

      <Route
        path={routes.login}
        element={
          session.role ? (
            <Navigate to={defaultRouteByRole[session.role]} replace />
          ) : (
            <LoginPage
              onLogin={session.login}
              isSubmitting={session.isAuthenticating}
              errorKey={session.error}
            />
          )
        }
      />
      <Route path={routes.terms} element={<PolicyPage kind="terms" />} />
      <Route path={routes.privacy} element={<PolicyPage kind="privacy" />} />

      <Route
        element={
          <ProtectedLayout
            role={session.role}
            onLogout={() => void session.logout()}
            isLoggingOut={session.isLoggingOut}
          />
        }
      >
        <Route
          path={routes.marketplace}
          element={
            <RoleRoute currentRole={session.role} allowedRole="Investor">
              <MarketplacePage />
            </RoleRoute>
          }
        />
        <Route
          path={routes.marketplaceDetail}
          element={
            <RoleRoute currentRole={session.role} allowedRole="Investor">
              <InvestmentDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path={routes.invest}
          element={
            <RoleRoute currentRole={session.role} allowedRole="Investor">
              <InvestmentRequestPage />
            </RoleRoute>
          }
        />
        <Route
          path={routes.documents}
          element={
            <RoleRoute currentRole={session.role} allowedRole="SME">
              <DocumentUploadPage />
            </RoleRoute>
          }
        />
        <Route
          path={routes.validation}
          element={
            <RoleRoute currentRole={session.role} allowedRole="Expert">
              <ExpertValidationPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
