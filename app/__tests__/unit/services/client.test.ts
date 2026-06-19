import { jest } from "@jest/globals";
import { z } from "zod";
import axios from "axios";
import { ApiError, NetworkError } from "../../../src/models/app-error";
import { errorHandler } from "../../../src/utils/error-handler";
import { logger } from "../../../src/utils/logger";
import {
  apiFetch,
  apiJson,
  apiJsonWithSchema,
  apiProxy,
  authJson,
  authJsonWithSchema,
  buildApiUrl,
  buildExternalApiUrl,
  ensureOk,
  externalFetch,
  externalJson,
  externalJsonWithSchema,
  getApiSourceClient,
  httpClientFacade,
  registerApiSource,
  sourceAuthFetch,
  sourceAuthJson,
  sourceAuthJsonWithSchema,
  sourceFetch,
  sourceJson,
  sourceJsonWithSchema,
} from "../../../src/services/client";

function toJsonPayload(value: unknown) {
  return JSON.stringify(value);
}

function createAxiosResponse({
  status = 200,
  statusText = "OK",
  data = toJsonPayload({ ok: true }),
  headers = { "content-type": "application/json" },
} = {}) {
  return {
    status,
    statusText,
    data,
    headers,
  };
}

describe("client", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers sources and normalizes base URLs", () => {
    const localhostClient = registerApiSource("localhost-source", {
      baseUrl: "localhost:5050/",
      credentials: "omit",
      scope: "localhost-source",
    });
    const remoteClient = apiProxy.registerSource("remote-source", {
      baseUrl: "api.quietwealth.example/",
      credentials: "include",
      scope: "remote-source",
    });

    expect(localhostClient.buildUrl("health")).toBe("http://localhost:5050/health");
    expect(remoteClient.buildUrl("/health")).toBe("https://api.quietwealth.example/health");
    expect(getApiSourceClient("remote-source")).toBe(remoteClient);
  });

  it("translates fetch requests through axios and returns a Response", async () => {
    const requestSpy = jest.spyOn(axios, "request").mockResolvedValue(
      createAxiosResponse({
        status: 202,
        statusText: "Accepted",
        data: "accepted",
        headers: { "content-type": "text/plain" },
      }),
    );
    const client = httpClientFacade.registerSource("request-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "include",
      scope: "request-source",
    });

    const response = await client.fetch("/documents", {
      method: "POST",
      body: JSON.stringify({ id: "doc-1" }),
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://api.quietwealth.example/documents",
        method: "POST",
        data: JSON.stringify({ id: "doc-1" }),
        withCredentials: true,
      }),
    );
    await expect(response.text()).resolves.toBe("accepted");
  });

  it("refreshes an authenticated request once after a 401", async () => {
    const requestSpy = jest
      .spyOn(axios, "request")
      .mockResolvedValueOnce(
        createAxiosResponse({ status: 401, statusText: "Unauthorized", data: new ArrayBuffer(0) }),
      )
      .mockResolvedValueOnce(
        createAxiosResponse({ status: 204, statusText: "No Content", data: new ArrayBuffer(0) }),
      )
      .mockResolvedValueOnce(
        createAxiosResponse({
          status: 200,
          data: toJsonPayload({ ok: true }),
        }),
      );
    const client = httpClientFacade.registerSource("auth-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "include",
      refreshOnUnauthorizedPath: "/api/auth/refresh",
      scope: "auth-source",
    });

    const response = await client.authFetch("/protected");

    expect(requestSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        url: "https://api.quietwealth.example/api/auth/refresh",
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("parses successful JSON payloads with a schema", async () => {
    jest.spyOn(axios, "request").mockResolvedValue(
      createAxiosResponse({
        data: toJsonPayload({ id: "doc-1", state: "processed" }),
      }),
    );
    const client = httpClientFacade.registerSource("schema-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "omit",
      scope: "schema-source",
    });

    const payload = await client.jsonWithSchema(
      "/documents/1",
      z.object({
        id: z.string(),
        state: z.string(),
      }),
    );

    expect(payload).toEqual({ id: "doc-1", state: "processed" });
  });

  it("raises ApiError for non-ok JSON responses", async () => {
    jest.spyOn(axios, "request").mockResolvedValue(
      createAxiosResponse({
        status: 500,
        statusText: "Server Error",
        data: toJsonPayload({ message: "Boom." }),
      }),
    );
    const errorSpy = jest.spyOn(errorHandler, "handle").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const client = httpClientFacade.registerSource("error-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "include",
      scope: "error-source",
    });

    await expect(client.json("/documents/1")).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        message: "Boom.",
        status: 500,
      }),
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      "API error response",
      expect.objectContaining({ status: 500 }),
    );
  });

  it("raises NetworkError for transport failures", async () => {
    jest.spyOn(axios, "request").mockRejectedValue(new Error("socket hang up"));
    const errorSpy = jest.spyOn(errorHandler, "handle").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const client = httpClientFacade.registerSource("network-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "omit",
      scope: "network-source",
    });

    await expect(client.fetch("/documents")).rejects.toEqual(
      expect.objectContaining<NetworkError>({
        name: "NetworkError",
        message: "Network error while calling API.",
      }),
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      "API network error",
      expect.objectContaining({ source: "network-source" }),
    );
  });

  it("covers the exported helper wrappers", async () => {
    const backendClient = httpClientFacade.source("backend");
    const externalClient = httpClientFacade.source("external");
    jest.spyOn(backendClient, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    jest.spyOn(backendClient, "authFetch").mockResolvedValue(new Response(null, { status: 200 }));
    jest.spyOn(backendClient, "json").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(backendClient, "authJson").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(backendClient, "jsonWithSchema").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(backendClient, "authJsonWithSchema").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(externalClient, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    jest.spyOn(externalClient, "json").mockResolvedValue({ id: "external-1" });
    jest.spyOn(externalClient, "jsonWithSchema").mockResolvedValue({ id: "external-1" });
    const sourceClient = httpClientFacade.registerSource("wrapper-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "omit",
      scope: "wrapper-source",
    });
    jest.spyOn(sourceClient, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    jest.spyOn(sourceClient, "authFetch").mockResolvedValue(new Response(null, { status: 200 }));
    jest.spyOn(sourceClient, "json").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(sourceClient, "authJson").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(sourceClient, "jsonWithSchema").mockResolvedValue({ id: "doc-1" });
    jest.spyOn(sourceClient, "authJsonWithSchema").mockResolvedValue({ id: "doc-1" });

    expect(buildApiUrl("/health")).toBe("/health");
    expect(buildExternalApiUrl("/feed")).toBe("/feed");
    expect(apiProxy.source("wrapper-source")).toBe(sourceClient);
    await expect(apiFetch("/health")).resolves.toBeInstanceOf(Response);
    await expect(apiJson("/health")).resolves.toEqual({ id: "doc-1" });
    await expect(apiJsonWithSchema("/health", z.object({ id: z.string() }))).resolves.toEqual({
      id: "doc-1",
    });
    await expect(authJson("/health")).resolves.toEqual({ id: "doc-1" });
    await expect(authJsonWithSchema("/health", z.object({ id: z.string() }))).resolves.toEqual({
      id: "doc-1",
    });
    await expect(externalFetch("/feed")).resolves.toBeInstanceOf(Response);
    await expect(externalJson("/feed")).resolves.toEqual({ id: "external-1" });
    await expect(externalJsonWithSchema("/feed", z.object({ id: z.string() }))).resolves.toEqual({
      id: "external-1",
    });
    await expect(sourceFetch("wrapper-source", "/health")).resolves.toBeInstanceOf(Response);
    await expect(sourceAuthFetch("wrapper-source", "/health")).resolves.toBeInstanceOf(Response);
    await expect(sourceJson("wrapper-source", "/health")).resolves.toEqual({ id: "doc-1" });
    await expect(sourceAuthJson("wrapper-source", "/health")).resolves.toEqual({ id: "doc-1" });
    await expect(
      sourceJsonWithSchema("wrapper-source", "/health", z.object({ id: z.string() })),
    ).resolves.toEqual({ id: "doc-1" });
    await expect(
      sourceAuthJsonWithSchema("wrapper-source", "/health", z.object({ id: z.string() })),
    ).resolves.toEqual({ id: "doc-1" });
  });

  it("returns quietly from ensureOk for ok responses", async () => {
    await expect(
      ensureOk(new Response(null, { status: 200 }), { method: "GET", url: "/ok", source: "unit" }),
    ).resolves.toBeUndefined();
  });

  it("preserves fully qualified URLs and array response headers", async () => {
    jest.spyOn(axios, "request").mockResolvedValue(
      createAxiosResponse({
        data: "ok",
        headers: {
          "content-type": "text/plain",
          "set-cookie": ["a=1", "b=2"],
        },
      }),
    );
    const client = httpClientFacade.registerSource("absolute-source", {
      baseUrl: "api.quietwealth.example",
      credentials: "omit",
      scope: "absolute-source",
    });

    const response = await client.fetch("https://other.example/health");

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://other.example/health",
        withCredentials: false,
      }),
    );
    expect(response.headers.get("set-cookie")).toBe("a=1, b=2");
  });
});
