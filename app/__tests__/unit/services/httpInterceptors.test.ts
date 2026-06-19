import { jest } from "@jest/globals";
import { ApiError } from "../../../src/models/app-error";
import { errorHandler } from "../../../src/utils/error-handler";
import { interceptHttpResponse } from "../../../src/services/httpInterceptors";

describe("interceptHttpResponse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates 401 responses to the unauthorized handler when enabled", () => {
    const shouldHandle = jest.fn().mockReturnValue(true);
    const handle = jest.fn();
    const response = new Response(null, { status: 401 });

    const result = interceptHttpResponse(
      response,
      { method: "GET", url: "/api/files" },
      {
        unauthorizedStrategy: {
          name: "unit-test-strategy",
          shouldHandle,
          handle,
        },
      },
    );

    expect(shouldHandle).toHaveBeenCalledWith({
      request: { method: "GET", url: "/api/files" },
    });
    expect(handle).toHaveBeenCalledWith({
      request: { method: "GET", url: "/api/files" },
    });
    expect(result).toBe(response);
  });

  it("does not delegate 401 responses when unauthorized handling is disabled", () => {
    const shouldHandle = jest.fn();
    const handle = jest.fn();
    const response = new Response(null, { status: 401 });

    interceptHttpResponse(
      response,
      { method: "GET", url: "/api/files" },
      {
        handleUnauthorized: false,
        unauthorizedStrategy: {
          name: "unit-test-strategy",
          shouldHandle,
          handle,
        },
      },
    );

    expect(shouldHandle).not.toHaveBeenCalled();
    expect(handle).not.toHaveBeenCalled();
  });

  it("reports 403 responses through the error handler", () => {
    const errorSpy = jest.spyOn(errorHandler, "handle").mockImplementation(() => undefined);
    const response = new Response(null, { status: 403 });

    interceptHttpResponse(response, { method: "POST", url: "/api/files" });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.any(ApiError),
      expect.objectContaining({
        scope: "http-interceptors",
        notifyUser: false,
      }),
    );
  });
});
