import { jest } from "@jest/globals";
import { sessionManager } from "../../../src/state/sessionManager";
import { logger } from "../../../src/utils/logger";
import {
  getUnauthorizedHandlingStrategy,
  handleUnauthorizedRequest,
  HttpOnlyCookieUnauthorizedHandlingStrategy,
  PlaceholderUnauthorizedHandlingStrategy,
  setUnauthorizedHandlingStrategy,
} from "../../../src/services/unauthorizedHandlingStrategy";

describe("unauthorized handling strategies", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    setUnauthorizedHandlingStrategy(new HttpOnlyCookieUnauthorizedHandlingStrategy());
  });

  it("ignores bootstrap auth endpoints for the cookie strategy", () => {
    const strategy = new HttpOnlyCookieUnauthorizedHandlingStrategy();

    expect(strategy.shouldHandle({ request: { method: "POST", url: "/api/auth/login" } })).toBe(
      false,
    );
    expect(strategy.shouldHandle({ request: { method: "GET", url: "/api/files" } })).toBe(true);
  });

  it("clears the session for protected requests", () => {
    const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => undefined);
    const handleSpy = jest
      .spyOn(sessionManager, "handleUnauthorized")
      .mockImplementation(() => undefined);
    const strategy = new HttpOnlyCookieUnauthorizedHandlingStrategy();

    strategy.handle({ request: { method: "GET", url: "/api/files" } });

    expect(warnSpy).toHaveBeenCalledWith("401 intercepted. Clearing session.", {
      method: "GET",
      url: "/api/files",
      strategy: "http-only-cookie-session",
    });
    expect(handleSpy).toHaveBeenCalledTimes(1);
  });

  it("allows swapping the active strategy", () => {
    const strategy = new PlaceholderUnauthorizedHandlingStrategy("test-strategy");

    setUnauthorizedHandlingStrategy(strategy);

    expect(getUnauthorizedHandlingStrategy()).toBe(strategy);
  });

  it("uses the provided strategy in handleUnauthorizedRequest", () => {
    const strategy = new PlaceholderUnauthorizedHandlingStrategy("custom");
    const shouldHandleSpy = jest.spyOn(strategy, "shouldHandle").mockReturnValue(true);
    const handleSpy = jest.spyOn(strategy, "handle").mockImplementation(() => undefined);

    handleUnauthorizedRequest({ method: "PATCH", url: "/api/files/1" }, strategy);

    expect(shouldHandleSpy).toHaveBeenCalledWith({
      request: { method: "PATCH", url: "/api/files/1" },
    });
    expect(handleSpy).toHaveBeenCalledWith({
      request: { method: "PATCH", url: "/api/files/1" },
    });
  });
});
