import { jest } from "@jest/globals";
import { act, render, waitFor } from "@testing-library/react";

const apiFetchMock = jest.fn();
const authFetchMock = jest.fn();
const buildApiUrlMock = jest.fn();
const httpClientFacadeMock = {
  fetch: apiFetchMock,
  authFetch: authFetchMock,
};

jest.unstable_mockModule("../../../src/services/client", () => ({
  apiFetch: apiFetchMock,
  authFetch: authFetchMock,
  buildApiUrl: buildApiUrlMock,
  httpClientFacade: httpClientFacadeMock,
}));

const { AuthProvider, useAuth } = await import("../../../src/auth/AuthProvider");

type AuthContextSnapshot = ReturnType<typeof useAuth>;

let latestAuthContext: AuthContextSnapshot | null = null;

function AuthConsumer() {
  latestAuthContext = useAuth();
  return null;
}

function createAuthMeResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      userId: "user-1",
      email: "user@example.com",
      tenantIds: [],
      tenantRoles: [],
      ...overrides,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}

describe("AuthProvider", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    latestAuthContext = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  function renderProvider() {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );
  }

  it("bootstraps the authenticated user from /api/auth/me", async () => {
    authFetchMock.mockResolvedValue(
      createAuthMeResponse({
        tenantIds: ["tenant-1"],
        tenantRoles: ["operator"],
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    expect(latestAuthContext?.isAuthenticated).toBe(true);
    expect(latestAuthContext?.user).toEqual({
      userId: "user-1",
      displayName: "user",
      email: "user@example.com",
      isGlobalAdmin: false,
      tenantIds: ["tenant-1"],
      tenantRoles: ["operator"],
    });
    expect(latestAuthContext?.noTenantAccess).toBe(false);
  });

  it("sets noTenantAccess when bootstrap receives 403", async () => {
    authFetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    expect(latestAuthContext?.isAuthenticated).toBe(false);
    expect(latestAuthContext?.noTenantAccess).toBe(true);
    expect(latestAuthContext?.user).toBeNull();
  });

  it("drops the session when /me does not include a user id", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    authFetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          email: "user@example.com",
          tenantIds: [],
          tenantRoles: [],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    expect(latestAuthContext?.isAuthenticated).toBe(false);
    expect(latestAuthContext?.user).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Authenticated response did not contain userId. Logging out.",
    );
  });

  it("posts credentials and reloads the authenticated user on login", async () => {
    authFetchMock.mockImplementation(() => Promise.resolve(createAuthMeResponse()));
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await act(async () => {
      await latestAuthContext?.login(" user@example.com ", "secret");
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "secret",
      }),
    });
    expect(authFetchMock).toHaveBeenCalledTimes(2);
    expect(latestAuthContext?.isAuthenticated).toBe(true);
  });

  it("builds the Microsoft login redirect from the current location", async () => {
    authFetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    buildApiUrlMock.mockReturnValue("https://api.quietwealth.example/api/auth/microsoft/login");
    window.history.replaceState({}, "", "/login");
    const assignSpy = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignSpy,
      },
    });

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    act(() => {
      latestAuthContext?.loginWithMicrosoft();
    });

    expect(assignSpy).toHaveBeenCalledWith(
      `https://api.quietwealth.example/api/auth/microsoft/login?returnUrl=${encodeURIComponent(
        `${window.location.origin}/login`,
      )}`,
    );
    expect(latestAuthContext?.isLoading).toBe(true);
  });

  it("uses the browser location when requesting a password reset", async () => {
    authFetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    window.history.replaceState({}, "", "/forgot-password");

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await act(async () => {
      await latestAuthContext?.requestPasswordReset("user@example.com");
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        redirectTo: `${window.location.origin}/forgot-password`,
      }),
    });
  });

  it("surfaces login failures from the API", async () => {
    authFetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    apiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Bad credentials." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await expect(latestAuthContext?.login("user@example.com", "secret")).rejects.toThrow(
      "Bad credentials.",
    );
    expect(latestAuthContext?.isLoading).toBe(false);
  });

  it("resets the password and reloads the authenticated user", async () => {
    authFetchMock.mockImplementation(() => Promise.resolve(createAuthMeResponse()));
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await act(async () => {
      await latestAuthContext?.resetPassword("access-token", "refresh-token", "new-password");
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        newPassword: "new-password",
      }),
    });
    expect(authFetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes the session and reports failed refresh attempts", async () => {
    authFetchMock.mockImplementation(() => Promise.resolve(createAuthMeResponse()));
    apiFetchMock
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await expect(latestAuthContext?.refresh()).resolves.toBe(true);
    await expect(latestAuthContext?.refresh()).resolves.toBe(false);
  });

  it("clears the user on logout", async () => {
    authFetchMock.mockResolvedValue(createAuthMeResponse());
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    renderProvider();

    await waitFor(() => {
      expect(latestAuthContext?.isLoading).toBe(false);
    });

    await act(async () => {
      await latestAuthContext?.logout();
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(latestAuthContext?.isAuthenticated).toBe(false);
    expect(latestAuthContext?.user).toBeNull();
  });

  it("throws when useAuth is read outside the provider", () => {
    function OutsideConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<OutsideConsumer />)).toThrow("useAuth must be used within AuthProvider");
  });
});
