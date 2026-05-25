import type { ZodTypeAny } from "zod";
import { ApiError, NetworkError } from "../models/app-error";
import { errorHandler } from "../utils/error-handler";
import { logger } from "../utils/logger";
import { parseWithSchema } from "../utils/schemaValidator";
import { interceptHttpResponse } from "./httpInterceptors";

export type ApiSourceName = string;

export type ApiSourceConfig = {
  baseUrl: string;
  credentials?: RequestCredentials;
  handleUnauthorized?: boolean;
  refreshOnUnauthorizedPath?: string;
  scope?: string;
};

type SourceRequestMeta = {
  method: string;
  url: string;
  source: ApiSourceName;
};

type ResolvedApiSourceConfig = {
  baseUrl: string;
  credentials: RequestCredentials;
  handleUnauthorized: boolean;
  refreshOnUnauthorizedPath: string | null;
  scope: string;
};

type RequestOptions = {
  handleUnauthorized: boolean;
};

export interface ApiSourceClient {
  readonly source: ApiSourceName;
  buildUrl(path: string): string;
  fetch(input: string, init?: RequestInit): Promise<Response>;
  authFetch(input: string, init?: RequestInit): Promise<Response>;
  json<T>(input: string, init?: RequestInit): Promise<T>;
  authJson<T>(input: string, init?: RequestInit): Promise<T>;
  jsonWithSchema<TSchema extends ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
  ): Promise<TSchema["_output"]>;
  authJsonWithSchema<TSchema extends ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
  ): Promise<TSchema["_output"]>;
}

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (trimmed.length === 0) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

function buildUrl(baseUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalized}`;
}

function resolveSourceConfig(config: ApiSourceConfig): ResolvedApiSourceConfig {
  return {
    baseUrl: normalizeApiBaseUrl(config.baseUrl),
    credentials: config.credentials ?? "include",
    handleUnauthorized: config.handleUnauthorized ?? true,
    refreshOnUnauthorizedPath: config.refreshOnUnauthorizedPath ?? null,
    scope: config.scope ?? "api-client",
  };
}

function withJsonContentType(init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return {
    ...init,
    headers,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      if (typeof body?.message === "string") {
        return body.message;
      }
      if (typeof body?.error === "string") {
        return body.error;
      }
      return JSON.stringify(body);
    }
    return await response.text();
  } catch {
    return "Request failed.";
  }
}

async function throwApiError(
  response: Response,
  request: SourceRequestMeta,
  scope: string,
): Promise<never> {
  const message = await readErrorMessage(response);
  const error = new ApiError(message || `Request failed with status ${response.status}.`, {
    status: response.status,
    context: {
      scope,
      request: {
        method: request.method,
        url: request.url,
        status: response.status,
      },
    },
  });

  errorHandler.handle(error, {
    scope,
    request: {
      method: request.method,
      url: request.url,
      status: response.status,
    },
    notifyUser: false,
  });

  logger.error("API error response", {
    source: request.source,
    method: request.method,
    url: request.url,
    status: response.status,
  });

  throw error;
}

export async function ensureOk(response: Response, request: SourceRequestMeta, scope = "api-client") {
  if (response.ok) {
    return;
  }

  await throwApiError(response, request, scope);
}

class SourceHttpClient implements ApiSourceClient {
  readonly source: ApiSourceName;
  private readonly config: ResolvedApiSourceConfig;

  constructor(source: ApiSourceName, config: ApiSourceConfig) {
    this.source = source;
    this.config = resolveSourceConfig(config);
  }

  buildUrl(path: string) {
    return buildUrl(this.config.baseUrl, path);
  }

  async fetch(input: string, init: RequestInit = {}) {
    return this.request(input, init, { handleUnauthorized: false });
  }

  async authFetch(input: string, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    let response = await this.fetch(input, init);

    if (response.status === 401 && this.config.refreshOnUnauthorizedPath) {
      const refreshResponse = await this.fetch(this.config.refreshOnUnauthorizedPath, { method: "POST" });
      if (refreshResponse.ok) {
        response = await this.fetch(input, init);
      }
    }

    return interceptHttpResponse(response, { method, url }, { handleUnauthorized: this.config.handleUnauthorized });
  }

  async json<T>(input: string, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    const response = await this.fetch(input, init);
    await ensureOk(response, { method, url, source: this.source }, this.config.scope);
    return (await response.json()) as T;
  }

  async authJson<T>(input: string, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    const response = await this.authFetch(input, init);
    await ensureOk(response, { method, url, source: this.source }, this.config.scope);
    return (await response.json()) as T;
  }

  async jsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    const response = await this.fetch(input, init);
    await ensureOk(response, { method, url, source: this.source }, this.config.scope);
    const payload = await response.json();
    return parseWithSchema(schema, payload, {
      schemaName: "API response",
      context: {
        scope: this.config.scope,
        request: { method, url, status: response.status },
      },
    });
  }

  async authJsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    const response = await this.authFetch(input, init);
    await ensureOk(response, { method, url, source: this.source }, this.config.scope);
    const payload = await response.json();
    return parseWithSchema(schema, payload, {
      schemaName: "authenticated API response",
      context: {
        scope: this.config.scope,
        request: { method, url, status: response.status },
      },
    });
  }

  private async request(input: string, init: RequestInit, options: RequestOptions) {
    const method = (init.method ?? "GET").toUpperCase();
    const url = this.buildUrl(input);
    const start = performance.now();
    const requestInit = withJsonContentType(init);

    logger.trace("API request", {
      source: this.source,
      method,
      url,
      hasBody: Boolean(requestInit.body),
    });

    try {
      const response = await fetch(url, {
        ...requestInit,
        credentials: this.config.credentials,
      });

      logger.info("API response", {
        source: this.source,
        method,
        url,
        status: response.status,
        ok: response.ok,
        durationMs: Math.round(performance.now() - start),
      });

      return interceptHttpResponse(response, { method, url }, { handleUnauthorized: options.handleUnauthorized });
    } catch (error) {
      const networkError = new NetworkError("Network error while calling API.", {
        context: {
          scope: this.config.scope,
          request: { method, url },
        },
        cause: error,
      });

      errorHandler.handle(networkError, {
        scope: this.config.scope,
        request: { method, url },
        notifyUser: false,
      });

      logger.error("API network error", {
        source: this.source,
        method,
        url,
        durationMs: Math.round(performance.now() - start),
        error: error instanceof Error ? error.message : String(error),
      });

      throw networkError;
    }
  }
}

const sourceClients = new Map<ApiSourceName, ApiSourceClient>();

export function registerApiSource(source: ApiSourceName, config: ApiSourceConfig) {
  const client = new SourceHttpClient(source, config);
  sourceClients.set(source, client);
  return client;
}

export function getApiSourceClient(source: ApiSourceName) {
  const client = sourceClients.get(source);
  if (!client) {
    throw new Error(`API source '${source}' is not registered. Register it with registerApiSource().`);
  }

  return client;
}

const RAW_BACKEND_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const RAW_EXTERNAL_API_BASE_URL = (import.meta.env.VITE_EXTERNAL_API_BASE_URL as string | undefined)?.trim();

export const BACKEND_API_SOURCE = "backend";
export const EXTERNAL_API_SOURCE = "external";

registerApiSource(BACKEND_API_SOURCE, {
  baseUrl: RAW_BACKEND_API_BASE_URL && RAW_BACKEND_API_BASE_URL.length > 0 ? RAW_BACKEND_API_BASE_URL : "",
  credentials: "include",
  handleUnauthorized: true,
  refreshOnUnauthorizedPath: "/api/auth/refresh",
  scope: "api-client",
});

registerApiSource(EXTERNAL_API_SOURCE, {
  baseUrl: RAW_EXTERNAL_API_BASE_URL && RAW_EXTERNAL_API_BASE_URL.length > 0 ? RAW_EXTERNAL_API_BASE_URL : "",
  credentials: "omit",
  handleUnauthorized: false,
  scope: "external-api-client",
});

const backendClient = getApiSourceClient(BACKEND_API_SOURCE);

export interface HttpClientFacade {
  registerSource(source: ApiSourceName, config: ApiSourceConfig): ApiSourceClient;
  source(source: ApiSourceName): ApiSourceClient;
  buildApiUrl(path: string): string;
  buildExternalApiUrl(path: string): string;
  fetch(input: string, init?: RequestInit): Promise<Response>;
  authFetch(input: string, init?: RequestInit): Promise<Response>;
  json<T>(input: string, init?: RequestInit): Promise<T>;
  authJson<T>(input: string, init?: RequestInit): Promise<T>;
  jsonWithSchema<TSchema extends ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
  ): Promise<TSchema["_output"]>;
  authJsonWithSchema<TSchema extends ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
  ): Promise<TSchema["_output"]>;
  externalFetch(input: string, init?: RequestInit): Promise<Response>;
  externalJson<T>(input: string, init?: RequestInit): Promise<T>;
  externalJsonWithSchema<TSchema extends ZodTypeAny>(
    input: string,
    schema: TSchema,
    init?: RequestInit,
  ): Promise<TSchema["_output"]>;
}

class DefaultHttpClientFacade implements HttpClientFacade {
  private static instance: DefaultHttpClientFacade | null = null;

  static getInstance() {
    if (!DefaultHttpClientFacade.instance) {
      DefaultHttpClientFacade.instance = new DefaultHttpClientFacade();
    }

    return DefaultHttpClientFacade.instance;
  }

  private constructor() {}

  registerSource(source: ApiSourceName, config: ApiSourceConfig) {
    return registerApiSource(source, config);
  }

  source(source: ApiSourceName) {
    return getApiSourceClient(source);
  }

  buildApiUrl(path: string) {
    return backendClient.buildUrl(path);
  }

  buildExternalApiUrl(path: string) {
    return getApiSourceClient(EXTERNAL_API_SOURCE).buildUrl(path);
  }

  fetch(input: string, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).fetch(input, init);
  }

  authFetch(input: string, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).authFetch(input, init);
  }

  json<T>(input: string, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).json<T>(input, init);
  }

  authJson<T>(input: string, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).authJson<T>(input, init);
  }

  jsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).jsonWithSchema(input, schema, init);
  }

  authJsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
    return getApiSourceClient(BACKEND_API_SOURCE).authJsonWithSchema(input, schema, init);
  }

  externalFetch(input: string, init: RequestInit = {}) {
    return getApiSourceClient(EXTERNAL_API_SOURCE).fetch(input, init);
  }

  externalJson<T>(input: string, init: RequestInit = {}) {
    return getApiSourceClient(EXTERNAL_API_SOURCE).json<T>(input, init);
  }

  externalJsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
    return getApiSourceClient(EXTERNAL_API_SOURCE).jsonWithSchema(input, schema, init);
  }
}

export const httpClientFacade = DefaultHttpClientFacade.getInstance();

export const apiProxy = {
  registerSource: (source: ApiSourceName, config: ApiSourceConfig) => httpClientFacade.registerSource(source, config),
  source: (source: ApiSourceName) => httpClientFacade.source(source),
};

export function buildApiUrl(path: string) {
  return httpClientFacade.buildApiUrl(path);
}

export function buildExternalApiUrl(path: string) {
  return httpClientFacade.buildExternalApiUrl(path);
}

export function sourceFetch(source: ApiSourceName, input: string, init: RequestInit = {}) {
  return getApiSourceClient(source).fetch(input, init);
}

export function sourceAuthFetch(source: ApiSourceName, input: string, init: RequestInit = {}) {
  return getApiSourceClient(source).authFetch(input, init);
}

export function sourceJson<T>(source: ApiSourceName, input: string, init: RequestInit = {}) {
  return getApiSourceClient(source).json<T>(input, init);
}

export function sourceAuthJson<T>(source: ApiSourceName, input: string, init: RequestInit = {}) {
  return getApiSourceClient(source).authJson<T>(input, init);
}

export function sourceJsonWithSchema<TSchema extends ZodTypeAny>(
  source: ApiSourceName,
  input: string,
  schema: TSchema,
  init: RequestInit = {},
) {
  return getApiSourceClient(source).jsonWithSchema(input, schema, init);
}

export function sourceAuthJsonWithSchema<TSchema extends ZodTypeAny>(
  source: ApiSourceName,
  input: string,
  schema: TSchema,
  init: RequestInit = {},
) {
  return getApiSourceClient(source).authJsonWithSchema(input, schema, init);
}

export function apiFetch(input: string, init: RequestInit = {}) {
  return httpClientFacade.fetch(input, init);
}

export function authFetch(input: string, init: RequestInit = {}) {
  return httpClientFacade.authFetch(input, init);
}

export function apiJson<T>(input: string, init: RequestInit = {}) {
  return httpClientFacade.json<T>(input, init);
}

export function authJson<T>(input: string, init: RequestInit = {}) {
  return httpClientFacade.authJson<T>(input, init);
}

export function apiJsonWithSchema<TSchema extends ZodTypeAny>(input: string, schema: TSchema, init: RequestInit = {}) {
  return httpClientFacade.jsonWithSchema(input, schema, init);
}

export function authJsonWithSchema<TSchema extends ZodTypeAny>(
  input: string,
  schema: TSchema,
  init: RequestInit = {},
) {
  return httpClientFacade.authJsonWithSchema(input, schema, init);
}

export function externalFetch(input: string, init: RequestInit = {}) {
  return httpClientFacade.externalFetch(input, init);
}

export function externalJson<T>(input: string, init: RequestInit = {}) {
  return httpClientFacade.externalJson<T>(input, init);
}

export function externalJsonWithSchema<TSchema extends ZodTypeAny>(
  input: string,
  schema: TSchema,
  init: RequestInit = {},
) {
  return httpClientFacade.externalJsonWithSchema(input, schema, init);
}
