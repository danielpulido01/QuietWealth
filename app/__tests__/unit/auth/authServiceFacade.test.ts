import { jest } from "@jest/globals";
import {
  authService,
  authServiceFacade,
  AuthServiceError,
  NoTenantAccessError,
} from "../../../src/auth/authService";

describe("authServiceFacade", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("delegates login to authService", async () => {
    const session = {
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
    const loginSpy = jest.spyOn(authService, "login").mockResolvedValue(session);

    await expect(authServiceFacade.login({ email: "user@example.com", password: "secret" })).resolves.toBe(session);

    expect(loginSpy).toHaveBeenCalledWith({ email: "user@example.com", password: "secret" });
  });

  it("recognizes typed auth errors", () => {
    expect(authServiceFacade.isAuthServiceError(new AuthServiceError("nope"))).toBe(true);
    expect(authServiceFacade.isNoTenantAccessError(new NoTenantAccessError("tenant"))).toBe(true);
    expect(authServiceFacade.isAuthServiceError(new Error("plain"))).toBe(false);
    expect(authServiceFacade.isNoTenantAccessError(new Error("plain"))).toBe(false);
  });

  it("formats fallback messages for unknown errors", () => {
    expect(authServiceFacade.toErrorMessage(new Error("Specific failure"))).toBe("Specific failure");
    expect(authServiceFacade.toErrorMessage("bad", "Fallback message")).toBe("Fallback message");
  });

  it("delegates the remaining auth operations to authService", async () => {
    const logoutSpy = jest.spyOn(authService, "logout").mockResolvedValue(undefined);
    const refreshSpy = jest.spyOn(authService, "refreshSession").mockResolvedValue(null);
    const resetRequestSpy = jest.spyOn(authService, "requestPasswordReset").mockResolvedValue(undefined);
    const resetPasswordSpy = jest.spyOn(authService, "resetPassword").mockResolvedValue(undefined);
    const currentSessionSpy = jest.spyOn(authService, "getCurrentSession").mockResolvedValue(null);

    await authServiceFacade.logout();
    await authServiceFacade.refreshSession();
    await authServiceFacade.requestPasswordReset("user@example.com", "https://quietwealth.example/reset");
    await authServiceFacade.resetPassword("access", "refresh", "new-password");
    await authServiceFacade.getCurrentSession();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(resetRequestSpy).toHaveBeenCalledWith("user@example.com", "https://quietwealth.example/reset");
    expect(resetPasswordSpy).toHaveBeenCalledWith("access", "refresh", "new-password");
    expect(currentSessionSpy).toHaveBeenCalledTimes(1);
  });
});
