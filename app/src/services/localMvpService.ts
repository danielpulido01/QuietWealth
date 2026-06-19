import {
  apiProxy,
  ensureOk,
  sourceFetch,
  sourceJsonWithSchema,
  type ApiSourceName,
} from "./client";
import {
  localLoginResponseSchema,
  smeListSchema,
  smeSchema,
  uploadDocumentPayloadSchema,
  validationRequestListSchema,
  type UploadDocumentPayload,
  type UserRole,
} from "../models/local-mvp";

const LOCAL_MVP_SOURCE: ApiSourceName = "local-mvp";

type RuntimeImportMeta = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const runtimeEnv = (import.meta as RuntimeImportMeta).env;
const apiBaseUrl = runtimeEnv?.VITE_API_BASE_URL?.trim() || "http://localhost:5147";

apiProxy.registerSource(LOCAL_MVP_SOURCE, {
  baseUrl: apiBaseUrl,
  credentials: "omit",
  handleUnauthorized: false,
  scope: "local-mvp",
});

type MarketplaceFilters = {
  search?: string;
  sector?: string;
  certificationStatus?: string;
  trustLevel?: string;
};

function buildQueryString(filters: MarketplaceFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function postJson(path: string, body: unknown) {
  const response = await sourceFetch(LOCAL_MVP_SOURCE, path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  await ensureOk(response, {
    method: "POST",
    url: apiProxy.source(LOCAL_MVP_SOURCE).buildUrl(path),
    source: LOCAL_MVP_SOURCE,
  });

  if (response.status === 204) {
    return null;
  }

  return response.headers.get("content-type")?.includes("application/json")
    ? response.json()
    : response.text();
}

export const localMvpService = {
  async login(role: UserRole) {
    return sourceJsonWithSchema(
      LOCAL_MVP_SOURCE,
      "/api/local-auth/login",
      localLoginResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({
          email: `${role.toLowerCase()}@quietwealth.test`,
          role,
        }),
      },
    );
  },

  async logout() {
    await postJson("/api/local-auth/logout", {});
  },

  async getMarketplace(filters: MarketplaceFilters) {
    return sourceJsonWithSchema(LOCAL_MVP_SOURCE, `/api/marketplace${buildQueryString(filters)}`, smeListSchema);
  },

  async getSme(id: string) {
    return sourceJsonWithSchema(LOCAL_MVP_SOURCE, `/api/marketplace/${id}`, smeSchema);
  },

  async getValidationRequests() {
    return sourceJsonWithSchema(LOCAL_MVP_SOURCE, "/api/validation/requests", validationRequestListSchema);
  },

  async uploadDocument(payload: UploadDocumentPayload) {
    const safePayload = uploadDocumentPayloadSchema.parse(payload);
    await postJson("/api/local-files/upload", safePayload);
  },

  async approveRequest(id: string) {
    await postJson(`/api/validation/requests/${id}/approve`, {});
  },

  async rejectRequest(id: string, reason: string) {
    await postJson(`/api/validation/requests/${id}/reject`, { reason });
  },

  buildDocumentUrl(fileName: string) {
    return apiProxy
      .source(LOCAL_MVP_SOURCE)
      .buildUrl(`/api/local-files/open?fileName=${encodeURIComponent(fileName)}`);
  },
};
