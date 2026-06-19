import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const useSessionMock = jest.fn();
const usePermissionsMock = jest.fn();

jest.unstable_mockModule("../../../src/components/hooks/useSession", () => ({
  useSession: useSessionMock,
}));

jest.unstable_mockModule("../../../src/components/hooks/usePermissions", () => ({
  usePermissions: usePermissionsMock,
}));

const { AuthGuard } = await import("../../../src/auth/guards/AuthGuard");
const { GuestGuard } = await import("../../../src/auth/guards/GuestGuard");
const { PolicyGuard } = await import("../../../src/auth/guards/PolicyGuard");

describe("auth guards", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders protected content for authenticated sessions", () => {
    useSessionMock.mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div>Protected content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useSessionMock.mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div>Protected content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects authenticated guests back home", () => {
    useSessionMock.mockReturnValue({
      session: { isAuthenticated: true },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Login form</div>
              </GuestGuard>
            }
          />
          <Route path="/home" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("renders the fallback when permissions are missing", () => {
    usePermissionsMock.mockReturnValue({
      permissions: [],
      hasPermission: jest.fn(),
      hasAllPermissions: jest.fn().mockReturnValue(false),
      hasAnyPermission: jest.fn().mockReturnValue(false),
    });

    render(
      <MemoryRouter>
        <PolicyGuard required={["dua.generate"]} fallback={<div>Missing access</div>}>
          <div>Protected action</div>
        </PolicyGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Missing access")).toBeInTheDocument();
  });
});
