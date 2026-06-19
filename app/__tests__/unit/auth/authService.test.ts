import { jest } from "@jest/globals";
import { authService, AuthServiceError } from "../../../src/auth/authService";
import { httpClientFacade } from "../../../src/services/client";
import { sessionManager } from "../../../src/state/sessionManager";

describe("authService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("logs in with a validated payload and returns the normalized session", async () => {
    const normalizedSession = {
      user: {
        id: "user-1",
        email: "user@example.com",
        isGlobalAdmin: false,
        tenantIds: [],
        tenantRoles: [],
      },
      roles: [],
      permissions: [],
      isAuthenticated: true,
    };

    jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    jest.spyOn(httpClientFacade, "authFetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          userId: "user-1",
          email: "user@example.com",
          isAuthenticated: true,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const setSessionSpy = jest
      .spyOn(sessionManager, "setSession")
      .mockReturnValue(normalizedSession);

    const result = await authService.login({
      email: " user@example.com ",
      password: "secret",
    });

    expect(httpClientFacade.fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "secret",
      }),
    });
    expect(setSessionSpy).toHaveBeenCalledWith({
      userId: "user-1",
      email: "user@example.com",
      isAuthenticated: true,
    });
    expect(result).toBe(normalizedSession);
  });

  it("clears the session and returns null when /me responds with 401", async () => {
    jest
      .spyOn(httpClientFacade, "authFetch")
      .mockResolvedValue(new Response(null, { status: 401 }));
    const clearSpy = jest.spyOn(sessionManager, "clearSession").mockImplementation(() => undefined);

    await expect(authService.getCurrentSession()).resolves.toBeNull();

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("throws NoTenantAccessError when /me responds with 403", async () => {
    jest.spyOn(httpClientFacade, "authFetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Tenant access required." }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    );
    const clearSpy = jest.spyOn(sessionManager, "clearSession").mockImplementation(() => undefined);

    await expect(authService.getCurrentSession()).rejects.toEqual(
      expect.objectContaining({
        name: "NoTenantAccessError",
        message: "Tenant access required.",
        status: 403,
      }),
    );

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("uses the current location as the default password reset redirect", async () => {
    jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    window.history.replaceState({}, "", "/forgot-password");

    await authService.requestPasswordReset("user@example.com");

    expect(httpClientFacade.fetch).toHaveBeenCalledWith("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        redirectTo: `${window.location.origin}/forgot-password`,
      }),
    });
  });

  it("throws AuthServiceError when reset password fails", async () => {
    jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Reset failed." }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      authService.resetPassword("access-token", "refresh-token", "new-password"),
    ).rejects.toEqual(
      expect.objectContaining<AuthServiceError>({
        name: "AuthServiceError",
        message: "Reset failed.",
        status: 400,
      }),
    );
  });

  it("returns null and clears the session when refresh fails", async () => {
    jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(new Response(null, { status: 401 }));
    const clearSpy = jest.spyOn(sessionManager, "clearSession").mockImplementation(() => undefined);

    await expect(authService.refreshSession()).resolves.toBeNull();

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("throws AuthServiceError with plain-text messages for failed logins", async () => {
    jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(
      new Response("Bad credentials.", {
        status: 401,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(
      authService.login({ email: "user@example.com", password: "secret" }),
    ).rejects.toEqual(
      expect.objectContaining<AuthServiceError>({
        name: "AuthServiceError",
        message: "Bad credentials.",
        status: 401,
      }),
    );
  });

  it("throws AuthServiceError when /me returns a non-auth error", async () => {
    jest.spyOn(httpClientFacade, "authFetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Server unavailable." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(authService.getCurrentSession()).rejects.toEqual(
      expect.objectContaining<AuthServiceError>({
        name: "AuthServiceError",
        message: "Server unavailable.",
        status: 500,
      }),
    );
  });

  it("clears the session even when logout fails", async () => {
    jest.spyOn(httpClientFacade, "fetch").mockRejectedValue(new Error("offline"));
    const clearSpy = jest.spyOn(sessionManager, "clearSession").mockImplementation(() => undefined);

    await expect(authService.logout()).rejects.toThrow("offline");

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
