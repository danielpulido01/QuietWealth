# QuietWealth — Expedited Financial Trust Record for SMEs

## Problem Statement

SMEs face slow, bureaucratic processes to certify their financial health, delaying capital access and investment. QuietWealth provides an expedited financial trust record by integrating document validation, risk analysis, and standardized financial conditions into a single certified report oriented to investors, establishing a low-risk certified investment ecosystem based on real revenue streams.

---

# 1. Frontend Design

## [1.1 Technology Stack](app/)

| Technology | Version | Justification |
|---|---|---|
| **Application Type** | SSR Web App | Server-side rendering enables auth-gated pages to be rendered on the server, reducing layout shift and preventing flash of unauthorized content for sensitive financial data |
| **React.js** | `19.2` | Industry-standard UI library with mature ecosystem; concurrent rendering features (`Suspense`, `React.lazy`) are essential for the document upload and long-running compilation flows |
| **Next.js** | `15` | Provides SSR, file-system routing, and built-in image optimization out of the box; integrates natively with Azure App Service Node.js runtime |
| **Node.js** | `22` | LTS release; required by Next.js 15 SSR runtime on Azure App Service |
| **TypeScript** | `5.9.3` | Static typing catches contract mismatches between API responses and UI state at compile time; essential for a data-intensive financial domain |
| **TailwindCSS** | `4.1` | Utility-first approach maps directly to the design token model; JIT compiler eliminates dead CSS in production with zero configuration |
| **Redux Toolkit** | `2.8` | Manages async thunks for document processing status tracking across page navigations; DevTools enable observability of state transitions during development |
| **Jest** | `30.2.0` | De-facto standard for React unit testing; compatible with TypeScript via `ts-jest`; supports coverage thresholds enforced in CI |
| **Zod** | `4.3.6` | Runtime schema validation for all API responses and form inputs; catches backend contract drift before data reaches Redux state |
| **Prettier** | `3.8.1` | Enforces uniform formatting across the team; integrated with Husky pre-commit hooks to block non-conforming commits |
| **ESLint** | `10.0.2` | Static analysis with custom rules that ban `dangerouslySetInnerHTML`, token storage in `localStorage`, and direct `console.log` calls |
| **Playwright** | `1.52` | Cross-browser E2E and integration testing; supports Chromium and Firefox; first-class `msw` integration for mocking backend responses |
| **Axios** | `1.9` | Provides interceptor support used by `AuthMiddleware` to attach Bearer tokens and handle 401 refresh centrally; cleaner API than native `fetch` for multipart document uploads |
| **Auth0 React SDK** | `2.2` | Manages OAuth 2.0 Authorization Code + PKCE flow and silent token refresh without custom implementation; Microsoft Entra ID is federated through Auth0 |
| **Husky** | `9.1.7` | Runs `lint-staged` on pre-commit; blocks commits that fail ESLint, Prettier, or TypeScript checks |
| **Cloud Service** | Azure | Consistent with the backend infrastructure; reduces operational complexity and cross-cloud latency |
| **Azure App Service** | — | Supports Node.js SSR runtimes natively; provides deployment slots (`staging → production`) enabling zero-downtime releases with instant rollback |
| **Code Repository** | GitHub | Enables GitHub Actions CI/CD with OIDC-based Azure deployment, avoiding long-lived credentials |
| **CI/CD** | GitHub Actions | OIDC token exchange with Azure App Service; branch-based environment promotion with manual approval for production |
| **Azure Application Insights SDK** | — | Unified telemetry for frontend and backend; correlates traces across browser, SSR layer, and backend API using a single `correlationId` |

---

## [1.2 UX / UI Analysis](app/)

### 1.2.1 Core Business Process

#### Login
1. The user accesses the QuietWealth platform and is presented with the authentication screen.
2. The user selects **Continue with Microsoft**.
3. Frontend redirects to Auth0 Universal Login, which federates with Microsoft Entra ID.
4. Auth0 returns an authorization code to the QuietWealth callback URL.
5. If authentication fails, Auth0 returns an error and the login screen displays the reason.
6. If successful, the session is created and the user is redirected to the Marketplace or Dashboard depending on their role.

---

#### Browse the Investment Marketplace
1. The investor lands on the Marketplace screen, which displays a list of certified SMEs available for investment.
2. The user can search for a specific company using the search bar.
3. The user can filter results by sector (e.g., Technology, Energy, Commerce) or by trust level.
4. Each SME card displays certification status, growth percentage, total raised capital, and number of active investors.
5. The user selects a company by clicking **Ver Detalles** to view the full investment profile.

---

#### Upload Financial Documents
1. The SME owner navigates to the **Cargar Documentos** section from the sidebar.
2. The system displays the document upload portal with a progress tracker: **Información Cargada → En Revisión por Expertos → Certificación Emitida**.
3. The user drags and drops files into the upload area or clicks **Seleccionar Archivos** to browse.
4. The system validates file formats (PDF, DOC, XLS, image) and size (max 10 MB per file) client-side via Zod before upload.
5. Once uploaded, documents enter the expert review queue automatically. The frontend sends `POST /api/trust-record-applications` and receives `HTTP 202 Accepted`.

---

#### Expert Validation Panel
1. A financial expert accesses the **Panel de Validación** section from the sidebar.
2. The system displays a list of pending SME certification requests with ID, company name, sector, submission date, and status.
3. The expert selects a pending request by clicking **Revisar**.
4. The expert reviews the uploaded documents and financial information.
5. The expert issues a certification decision, which updates the SME's trust status on the platform.

---

#### View Investment Detail
1. From the Marketplace, the investor clicks **Ver Detalles** on a specific SME card.
2. The system shows key financial metrics: Total Raised, Active Investors, Growth Rate, and Average ROI.
3. The user can scroll down to view detailed charts: Income Growth, Investor Growth, and Accumulated Capital Over Time.
4. The screen displays a company description and key business metrics such as retention rate, MRR, and profit margin.
5. The investor can click **Invertir Ahora** to initiate the investment flow.

---

#### Logout
1. The user ends their session through the logout option in the navigation.
2. Auth0 SDK calls `logout()`, invalidating the session both locally and on Auth0 servers.
3. The session is terminated and the user is redirected to the Login screen.

---

### 1.2.2 Wireframes

#### Login Screen
Microsoft-authenticated entry point to the platform via Auth0 Universal Login. A single **Continue with Microsoft** button is shown — no manual credential form.

![Login](Media/login.png)

---

#### Marketplace Screen
Lists certified SMEs with key financial metrics and trust indicators for investors to browse and compare.

![Marketplace](Media/marketPlace.png)

---

#### Document Upload Screen
Allows SMEs to submit financial documents for expert review and certification. Shows a progress tracker with three stages.

![Upload Document](Media/loadDocuments.png)

---

#### Expert Validation Panel Screen
Enables financial experts to review and certify pending SME applications.

![Validation](Media/validacion.png)

---

#### Investment Detail Screen
Shows verified SME financial metrics, growth charts, and expert certifications to support investor decision-making.

![Investment Detail 01](Media/DetalleInv01.png)
![Investment Detail 02](Media/DetalleInv02.png)
![Investment Detail 03](Media/DetalleInv03.png)

---

### Testing results

Tabla testing · MD
| Participant | Duration | OS | Browser | Opinion Scale (1–5) | Open Feedback |
|-------------|----------|----|---------|---------------------|---------------|
| 542521286 | 49s | Windows | Chrome | 4 | "Considero que la información mostrada es clara." |
| 510669335 | 42s | Windows | Chrome | 5 | "Esta bien" |
| 543901432 | 17.8s | Windows | Brave | 4 | "all good" |
| 508804036 | 70.1s | Windows | Edge | 5 | "." |
| 542802936 | 99.5s | Windows | Edge | 5 | "Anuncios de invierta ahora no deberían de aparecer en la aplicación como tal, solo en una web." |
| 537502878 | 50.1s | Linux | Firefox | 5 | "Muy detallada y presentable, no mejoraría nada." |
| **Average** | **54.8s** | — | — | **4.7 / 5** | — |

---

### Heatmaps for clicks and drop-offs

**Investment Detail Screen**
![Dinv-HeatMap01](Media/heatmap1.png)
![Dinv-HeatMap02](Media/heatmap2.png)
![Dinv-HeatMap03](Media/heatmap3.png)

#### Usability Issues Detected

| # | Screen | Issue | Severity |
|---|---|---|---|
| 1 | Investment Detail | The "Invertir Ahora" CTA feels too prominent within the platform; one participant noted it is more appropriate for an external web page. | Medium |

#### Corrections Applied

| # | Issue | Correction | Decision Criteria |
|---|---|---|---|
| 1 | "Invertir Ahora" CTA felt intrusive inside the platform | Reduced visual weight of the CTA within the Investment Detail screen | Keeps the platform focused on trust and information rather than aggressive selling |

![Updated Banner](Media/DetalleInv_bannerCambiado.png)

---

## Authentication and Authorization

# Backend Design

## Technology Stack
- API style: REST API over HTTPS
- API specification standard: OpenAPI
- API gateway and hosting: Azure API Management + Azure App Service
- Database: Azure SQL Database
- File storage: Azure Blob Storage
- Asynchronous operations and notifications: Azure Notification Hubs
- Load balancing: no dedicated load balancer required for the expected traffic profile
- Backend framework and language: .NET SDK 10.0.102, ASP.NET Core
- Repository structure: monorepo shared with the frontend; backend folder: (AGREGAR) ``
- Testing: xUnit for unit and integration tests
- API documentation tooling: Swagger / OpenAPI tooling for contract publication and validation
- Code quality: `dotnet format` and built-in .NET analyzers
- Services (CAMBIAR):
  - Authentication service
  - Document upload service
  - DUA generation orchestration service
  - Notification service
  - Result download service

## Security
- Transport security: HTTPS enforced at Azure API Management for all public endpoints
- Authentication:
  - Username, password, and OTP are validated server-side
  - After successful credential and OTP validation, the backend issues JWT bearer tokens
  - JWT signing algorithm: RS256
  - JWT tokens are required for all protected endpoints
- Encryption at rest:
  - Azure SQL Database uses Transparent Data Encryption (TDE) with service-managed keys
  - Reference: https://learn.microsoft.com/en-us/azure/azure-sql/database/security-overview?view=azuresql#transparent-data-encryption-encryption-at-rest-with-service-managed-keys
- Request payload limits:
  - General API payload limit: 10 MB
  - File upload endpoints exception: up to 100 MB per request to support realistic document sets with multiple PDF, Excel, Word, and scanned image files
  - Requests above these limits must be rejected with a clear validation error
- Rate limiting at Azure API Management:
  - Maximum concurrent connections per authenticated client: 10
  - Request rate limit per authenticated client: 60 requests per minute
  - Stricter limits must be applied to authentication endpoints to reduce abuse risk
- Data retention and archiving:
  - Production operational data and generated files remain in the active production environment for 90 days
  - After 90 days, records and generated artifacts are moved to an archive tier for audit and traceability purposes
  - Archived data is retained according to institutional or customs compliance requirements

## Observability
- Telemetry platform: Azure Application Insights, aligned with the frontend for unified end-to-end telemetry
- Dashboard and analysis tool: Azure Monitor
- Logged backend events:
  - AuthLoginRequested
  - AuthLoginSucceeded
  - AuthLoginFailed
  - OtpValidationSucceeded
  - OtpValidationFailed
  - UserLoggedOut
  - FileUploadStarted
  - FileUploadCompleted
  - FileUploadRejected
  - SupportedFilesValidated
  - <<Agregar otros>>
  - <<Agregar otros>>
  - <<Agregar otros>>
  - <<Agregar otros>>
  - <<Agregar otros>>
  - ApiRequestFailed
  - UnhandledExceptionCaptured
- Progress polling guideline: do not log every frontend polling request; log only meaningful status transitions and exceptional progress-check failures

### Operational metrics (required)
- Latency metrics: at minimum P95/P99 per API endpoint and critical business flow.
- Error metrics: request error rate (4xx/5xx), dependency failure rate, and timeout rate.
- Saturation metrics: CPU/memory utilization, queue depth/age, and worker concurrency saturation.
- Monitoring stack options:
  - Self-managed: Prometheus + Grafana.
  - Managed: Azure Monitor.

### Application observability patterns (required)
- Health checks: implement `liveness` and `readiness` endpoints for API and workers.
- Correlation IDs: propagate a single correlation ID across all services, async messages, logs, traces, and domain events.
- SLIs defined from design: availability and latency SLIs must be defined at architecture stage for each critical user flow.

## Infrastructure (DevOps)
<<Falta agregar los scripts de provisioning para ci cd>>
<<Podemos agregar las reglas que va a tener el github para branching y demás>>

### CI/CD orchestration tool
- Standard tool: **Azure DevOps Pipelines** (single CI/CD control plane from this monorepo).
- Rationale: repository-native workflows, PR checks, environments, approvals, and strong Azure integration.

### Infrastructure as Code (IaC)
- Standard tool: **Terraform** for provisioning and updates across environments.
- Managed resources via Terraform:
- Azure API Management
- Azure App Service (API hosting)
- Azure SQL Database
- Azure Blob Storage
- Azure Notification Hubs
- Observability resources (Application Insights / Azure Monitor where applicable)

### Environments and deployment model
- Environments: `dev`, `stage`, `prod` (isolated by resource group and/or subscription).
- Deployment pattern:
- `dev`: automatic deployment on merge to `develop`.
- `stage`: automatic deployment from `main` after CI success.
- `prod`: manual approval + protected environment gate.
- Application deployment target: **Azure App Service** (no Kubernetes required for current scope).
- Production release strategy: deployment slots (`staging` -> `production`) with slot swap and rollback.

### Pipeline structure
- `ci-frontend`: install, lint, test, build frontend.
- `ci-backend`: restore, build, test backend (.NET), run static analysis/format checks.
- `security-scan`: dependency/license checks and secret scanning.
- `infra-plan`: `terraform fmt` + `terraform validate` + `terraform plan` per environment.
- `deploy-dev` / `deploy-stage` / `deploy-prod`: apply infra changes (as approved) and deploy application artifacts.

### Governance and quality gates
- Required PR checks before merge: frontend CI, backend CI, security scan.
- Protected branches: `main` and release branches.
- Environment approvals required for `prod`.
- Artifact/version traceability required per deployment (commit SHA, build ID, release timestamp).

## Availability
<<No creo que necesitemos 4 nueves, creo que podemos bajarlo a 3>>
99.99% uptime = 0.01% downtime per year = 52.56 minutes/year (≈ 0.876 hours/year)

### Resilience patterns (required)
- Circuit breaker per downstream dependency (SQL, Blob, Notification Hubs, external APIs) to fail fast when an integration is unhealthy and protect API latency.
- Timeouts + retries with exponential backoff (and jitter) for transient failures; retries only for idempotent operations or operations protected with idempotency keys.
- Bulkhead isolation so one slow dependency cannot collapse the full API: separate connection pools, bounded concurrency, and isolated worker/queue paths by integration.

### Controlled degradation (required)
- Feature flags to disable non-critical capabilities quickly (notifications, advanced enrichments, non-essential validations) while preserving core transaction flows.
- Partial responses when optional downstream data is unavailable; return available data + explicit `partial=true` and error details per missing section.
- Absorption queues (outbox + async processing) for burst traffic and slow dependencies to decouple request handling from eventual side effects.

With the most recent official SLA (April 8, 2026) for your stack:

|Component	| SLA | Maximum theoretical downtime/year|
|-----------|-----|--------------------------|
|Azure API Management |	99.99% (Premium multi-region)	| 4.38 h / 0.876 h|
|Azure App Service	| 99.99% (with 2+ AZ) | 4.38 h / 0.876 h|
|Azure SQL Database	| 99.99% (no zone-redundant) / 99.995% (zone-redundant)	| 0.876 h / 0.438 h|
|Azure Blob Storage	| 99.9% write hot; 99.99% read RA-GRS/RA-GZRS (depends on tier/redundancy) | 8.76 h / 0.876 h|
|Azure Notification Hubs | 99.9% | 8.76 h|

### Single points of failure (SPOF)
- APIM in a single region or tier without multi-region.
- App Service without Availability Zones.
- SQL without zone redundancy + regional failover.
- Blob in the synchronous write path (99.9% typical for write hot).
- Notification Hubs if treated as a critical path of the transaction.

### Recovery/mitigation for what doesn't provide 99.99% "by default"
- APIM: use Premium with multi-region deployment and failover.
- App Service: deploy across 2+ Availability Zones (ideally with a regional DR strategy).
- SQL: zone-redundant + auto-failover group regional.
- Blob: RA-GZRS/RA-GRS, retries with backoff, and decouple writing with asynchronous processing.
- Notification Hubs: avoid blocking the main flow; use outbox + retries + DLQ + alternate channel (email/SMS) for incidents.

## Scalability

## Backend key workflows

### User authentication and session validation
1. The frontend sends credentials to [`IdentityAccessController`](/server/QuietWealth.Backend/domains/identity-access/controllers/IdentityAccessController.cs).
2. The backend validates the [`LoginRequest`](/server/QuietWealth.Backend/domains/identity-access/models/LoginRequest.cs).
3. `IdentityAccessService` validates credentials, permissions, and session state.
4. The backend creates a session through [`IUserSessionRepository`](/server/QuietWealth.Backend/domains/identity-access/repositories/IUserSessionRepository.cs).
5. The backend returns a `LoginResponse` with JWT, user summary, roles, permissions, and expiration.
6. Protected endpoints validate the JWT before running business logic.
7. Logout invalidates the session and emits `UserLoggedOut`.

Errors: `401 Unauthorized` for invalid credentials, `403 Forbidden` for missing permissions, expired tokens redirect the user to login.

---

### SME document intake
1. The SME sends files to [`DocumentIntakeController`](/server/QuietWealth.Backend/domains/document-intake/controllers/DocumentIntakeController.cs).
2. The backend checks `files.upload` permission and validates [`UploadFilesRequest`](/server/QuietWealth.Backend/domains/document-intake/models/UploadFilesRequest.cs).
3. Files are validated by format and size.
4. `DocumentIntakeService` creates a `DocumentBatch` with `SourceDocument` records.
5. Metadata is saved through [`IDocumentBatchRepository`](/server/QuietWealth.Backend/domains/document-intake/repositories/IDocumentBatchRepository.cs).
6. File content is stored in Azure Blob Storage.
7. The batch becomes `uploaded` or `rejected`.
8. The backend emits `FilesUploadStarted`, `FilesUploadCompleted`, or `FilesUploadRejected`.
9. The backend returns `UploadFilesResponse`.

Errors: `400 Bad Request` for invalid files, `413 Payload Too Large` for oversized uploads, `503 Service Unavailable` for storage failures.

---

### Expert validation and SME certification
1. The expert requests pending SME submissions.
2. The backend validates expert permissions.
3. The backend loads pending `DocumentBatch` and `SourceDocument` metadata.
4. The expert submits a decision: `approved`, `rejected`, or `needs_changes`.
5. The backend validates that the batch is still reviewable.
6. The certification service stores reviewer id, timestamp, notes, decision, and trust level.
7. Approved SMEs become visible in the marketplace.
8. Rejected or incomplete submissions remain hidden and trigger a notification.
9. The backend emits a certification decision audit event.

Errors: `403 Forbidden` for non-experts, `409 Conflict` for finalized batches, `400 Bad Request` for invalid decisions.

---

### Investment marketplace browsing
1. The investor requests the marketplace list.
2. The backend validates session and marketplace read permission.
3. The backend queries only SMEs with active certification.
4. Optional filters are applied: sector, trust level, growth, capital raised, and search text.
5. The backend returns paginated card data: company, sector, badge, growth, raised capital, investors, and trust level.
6. Financial documents are never returned in list responses.

Errors: `400 Bad Request` for invalid filters, `200 OK` with empty list for no results, `503 Service Unavailable` for read model failures.

---

### Investment detail read flow
1. The investor requests an SME detail by id.
2. The backend verifies that the SME is certified and visible.
3. The backend loads company profile, certification summary, metrics, and chart data.
4. Authorization rules decide which metrics are visible.
5. The response includes raised capital, active investors, growth rate, ROI, description, retention, MRR, and profit margin.
6. Optional chart failures return `partial=true` with structured warning details.

Errors: `404 Not Found` for missing or non-visible SMEs, `403 Forbidden` for restricted metrics.

---

### Audit and observability event capture
1. Domain services emit events for meaningful business transitions.
2. Events include correlation id, actor id, timestamp, event type, aggregate id, and safe metadata.
3. Audit entries are saved through [`IAuditEntryRepository`](/server/QuietWealth.Backend/domains/audit-observability/repositories/IAuditEntryRepository.cs).
4. Logs and traces are sent to Azure Application Insights.
5. Azure Monitor tracks authentication, uploads, validation decisions, failures, and dependency health.

Errors: audit failures are logged as operational incidents and retried through outbox when possible.

---

### Data retention and archival
1. A scheduled job identifies records older than the active retention window.
2. The service applies [`RetentionPolicyOptions`](/server/QuietWealth.Backend/shared/Configuration/RetentionPolicyOptions.cs).
3. Eligible SQL records and Blob artifacts are moved to archival state.
4. Archive metadata stores status, location, timestamp, and retention category.
5. Links between SMEs, documents, certifications, and audit entries are preserved.
6. The backend emits `RecordsArchived`.

Errors: legal-hold records are skipped, partial failures are resumable, archive operations must be idempotent.

## Architecture diagram in layers

## Design Considerations

## Source Code

### Backend scaffold generation scope
- Use a specialized scaffolding agent to generate the backend skeleton in `server/` from this technical specification.
- Target stack for scaffolded code: ASP.NET Core (.NET SDK 10.0.102) with adapters for Azure SQL, Azure Blob Storage, and Azure Notification Hubs.
- The generated output must include only structure artifacts: project/solution files, folders, class/interface definitions, DTOs, request/response contracts, configuration classes, DI wiring, and CI/CD scripts/templates.
- The generated output must not include functional business logic: no extraction/mapping algorithms, no production SQL queries, no external API side effects, and no hardcoded credentials.
- Methods may be created as stubs (`throw new NotImplementedException()` or equivalent) until implementation phase.

### Monorepo target structure (backend, domain-first)
- Backend root: [`server/`](/server)
- Source root: [`server/src/`](/server/QuietWealth.Backend)
- Domain modules root: [`server/QuietWealth.Backend/domains/`](/server/QuietWealth.Backend/domains)
- Cross-domain ACL root: [`server/QuietWealth.Backend/acls/`](/server/QuietWealth.Backend/acls)
- Shared kernel root: [`server/QuietWealth.Backend/shared/`](/server/QuietWealth.Backend/shared)
- Tests root: [`server/tests/`](/server/tests)
- Deployment/IaC root: [`server/deploy/`](/server/deploy)

### Required structure inside each domain module
- For every domain folder under `domains/<domain-name>/`, scaffold exactly these subfolders:
  - `controllers/`
  - `models/`
  - `repositories/`
  - `services/`
- Example domains to scaffold first:
  - [`server/QuietWealth.Backend/domains/identity-access/`](/server/QuietWealth.Backend/domains/identity-access)
  - [`server/QuietWealth.Backend/domains/document-intake/`](/server/QuietWealth.Backend/domains/document-intake)
  - [`server/QuietWealth.Backend/domains/retention-archival/`](/server/QuietWealth.Backend/domains/retention-archival)
  - <<Agregar otros>>

### ACL policy for cross-domain communication
- All cross-domain calls must go through the ACL layer in [`server/QuietWealth.Backend/acls/`](/server/QuietWealth.Backend/acls).
- No domain is allowed to reference another domain's `repositories/` or `services/` directly.
- ACLs must expose explicit translator/adaptor contracts between domains (anti-corruption boundary).
- Suggested ACL modules:
  - <<Agregar otros>>


### CI/CD and IaC source folders

#### GitHub Environments
Two environments must exist in the repo settings:

| Environment | Branch | App suffix |
|---|---|---|
| `QA` | `staging` | `qa*` |
| `Production` | `main` | `prod*` |

#### Workflows
Four workflow files, all following the same structure.

**Triggers:**
- Push to `main` → `paths: server/**` or `app/**` → deploys to Production
- Push to `staging` → same path filters → deploys to QA
- All support `workflow_dispatch`

**Job pattern:**
```
build (environment: QA|Production, permissions: contents:read)
  └─ deploy (needs: build, permissions: id-token:write + contents:read)
```

To enable OIDC token exchange with azure, `id-token: write` is required on the `deploy` job only.

#### Secrets (stored per GitHub environment)

**QA environment:**
```
AZUREAPPSERVICE_CLIENTID_QA_FRONTEND
AZUREAPPSERVICE_CLIENTID_QA_API
AZUREAPPSERVICE_TENANTID_QA
AZUREAPPSERVICE_SUBSCRIPTIONID_QA
VITE_API_BASE_URL                    ← build-time only, frontend
```

**Production environment:**
```
AZUREAPPSERVICE_CLIENTID_PROD_FRONTEND
AZUREAPPSERVICE_CLIENTID_PROD_API
AZUREAPPSERVICE_TENANTID_PROD
AZUREAPPSERVICE_SUBSCRIPTIONID_PROD
VITE_API_BASE_URL_PROD               ← build-time only, frontend
```

`VITE_API_BASE_URL*` is injected as `env:` on the `npm run build` step — baked into the static bundle at build time. It is **not** an Azure app setting.

**Azure login step:**
```yaml
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZUREAPPSERVICE_CLIENTID_QA_FRONTEND }}
    tenant-id: ${{ secrets.AZUREAPPSERVICE_TENANTID_QA }}
    subscription-id: ${{ secrets.AZUREAPPSERVICE_SUBSCRIPTIONID_QA }}
```

#### OIDC / Entra ID Setup (`infra/setup-github-oidc.ps1`)
Run once per environment. Idempotent. Require `az login` + `gh auth login`.
For each of the 4 app/role combos (`prod-frontend`, `prod-api`, `qa-frontend`, `qa-api`):

1. Create Entra ID app registration named `dp-{env}-{role}-deploy`
2. Create a service principal for it
3. Add a federated credential:
   - issuer: `https://token.actions.githubusercontent.com`
   - subject: `repo:{owner/repo}:environment:{Production|QA}`
   - audience: `api://AzureADTokenExchange`
4. Assign `Contributor` role scoped to the specific Web App resource (not subscription-wide)
5. Call `gh secret set` to write the 3 OIDC secrets into the correct GitHub environment

Each Web App has its own Entra app registration and `clientId`. `tenantId` and `subscriptionId` are shared within an environment.

#### Bicep Infra (`infra/`)

**Scope:** `subscription` level — creates the resource group itself.

**Locations:**
- RG metadata: `eastus`
- Resources deployed to: `westcentralus`

**Per-environment resources:**
- Linux App Service Plan `asp-dp-{env}` — SKU B1 (shared)
- Frontend Web App (`Node|24-lts`) — startup: `npx --yes serve -s . -l $PORT`
- API Web App (`DOTNETCORE|10.0`) — startup: `dotnet QuietWealth.Api.dll`

**API app settings provisioned by Bicep:**
```
ASPNETCORE_ENVIRONMENT    = "Production" (prod) | "Development" (qa — enables Swagger)
Supabase__Url             = <from SUPABASE_URL env var>
Supabase__ServiceKey      = <from SUPABASE_SERVICE_KEY env var>
AllowedOrigins__0         = https://{frontendAppName}.azurewebsites.net
WEBSITE_RUN_FROM_PACKAGE  = 1
```

**Frontend app settings provisioned by Bicep:**
```
WEBSITE_NODE_DEFAULT_VERSION   = ~20
SCM_DO_BUILD_DURING_DEPLOYMENT = false   ← disables Oryx; we ship pre-built /dist
```

**Parameters per environment:**

| Param | qa | prod |
|---|---|---|
| `resourceGroupName` | `QuietWealth` | `QuietWealth` |
| `resourceGroupLocation` | `eastus` | `eastus` |
| `servicesLocation` | `westcentralus` | `westcentralus` |
| `appServicePlanSku` | `B1` | `B1` |
| `frontendAppName` | `qaquietwealth-frontend` | `prodquietwealth-frontend` |
| `apiAppName` | `qaquietwealth-api` | `prodquietwealth-api` |

**Secrets flow into Bicep via `.bicepparam`:**
```bicep
param supabaseUrl        = readEnvironmentVariable('SUPABASE_URL', '')
param supabaseServiceKey = readEnvironmentVariable('SUPABASE_SERVICE_KEY', '')
```

Set before running `deploy.ps1`:
```powershell
$env:SUPABASE_URL         = '...'
$env:SUPABASE_SERVICE_KEY = '...'
.\deploy.ps1 -Environment qa   # or prod
```

Local values live in `deploy.secrets.ps1` (gitignored via `*.secrets.ps1`). These secrets are never in GitHub Actions secrets — infra deployment is manual only.

**Deploy command (run by `deploy.ps1`):**
```powershell
az deployment sub create `
  --name        dp-{env}-{timestamp} `
  --location    westcentralus `
  --template-file main.bicep `
  --parameters  parameters/{env}.bicepparam
```

#### Trigger Conditions & Job Dependencies

| Workflow file | Branch | Path filter | Artifact name |
|---|---|---|---|
| `main_prodquietwealth-frontend.yml` | `main` | `app/**` | `node-app` |
| `main_prodquietwealth-api.yml` | `main` | `server/**` | `.net-app` |
| `staging_qaquietwealth-frontend.yml` | `staging` | `app/**` | `node-app` |
| `staging_qaquietwealth-api.yml` | `staging` | `server/**` | `.net-app` |

Artifact is passed between jobs via `actions/upload-artifact` / `actions/download-artifact`.

#### Key Constraints

- Each Web App has its **own** Entra app registration and `clientId` — do not share across frontend/API
- `id-token: write` must be on the **deploy job**, not the build job
- `VITE_*` vars are build-time secrets, not runtime app settings — must be in the build job's `env:` block
- `Supabase__Url` / `Supabase__ServiceKey` use ASP.NET Core's double-underscore config convention (maps to `Supabase:Url` / `Supabase:ServiceKey`)
- Bicep `@secure()` params never appear in deployment logs




















### Scaffold acceptance criteria
- Solution compiles successfully with empty/stub implementations.
- OpenAPI document is generated for all planned endpoints.
- Dependency injection registrations resolve at startup.
- Each domain contains `controllers`, `models`, `repositories`, and `services`.
- Cross-domain dependencies are only implemented through the `acls` folder.

### Backend Design Patterns







# Data Design

# Auth

## Recomendaciones Rodri
- Definir qué contenidos va a tener el JWT
- Ver lo del HTTPS required
- Client ID and Client Secret irían dentro del jwt
- Cuánto de expiración al token
- Cuánto al refresh
- CSRF donde ponerlo, qué es?
- Qué vamos a hacer con esos casos que puede tardar hasta 5 segundos para auth? Progress bar o label para indicar al usuario
- Soporta thousands concurrent pero cuántos necesita mi app? Ver cuántos esperamos y ver si están bajo el treshold estamos bien
- El jwt probablemente no pase de 10 kb pero hay que definir lo que lleva
- Cuantificar cuantas autenticaciones en el horario establecido
- Quitar la hablada innecesaria
- Aterrizar bien el workflow

---

## Integration Spec

### Name
Auth0 Authentication Platform by Okta

### Protocol
- HTTPS
- REST API
- OAuth 2.0
- JSON Web Tokens (JWT)

Integrated Identity Providers:
- Microsoft Login (Microsoft Entra ID)

### Security Constraints
- OAuth 2.0 Authorization Code Flow
- JWT validation
- Session validation in backend
- HTTPS required for all authentication traffic
- MFA support available through Auth0
- Client ID and Client Secret required
- Token expiration validation
- Refresh token rotation
- CSRF protection using state parameter
- Security integrated with Microsoft Entra ID through Auth0 federation

### Configuration and Secure Parameter Storage

Configuration parameters:
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_CALLBACK_URL
- AUTH0_AUDIENCE

Secure storage locations:
- .env files for local development
- Azure Key Vault for production and QA
- GitHub Actions Secrets

### Throughput

Expected integration characteristics:
- Average authentication response time: 1–5 seconds
- JWT payload size: below 10 KB
- Support for thousands of concurrent authentication requests

Potential bottleneck:
Large concurrent login spikes during business hours for SME users accessing financial trust records.

No mitigation necessary since we expect XXX users daily and are not expecting thousands of concurrent auth requests. JSON payloads will have a size of XX KB which is handled easily by Auth0.

### Workload

Expected workload scenario:
- High login activity between 7:00 AM and 6:00 PM
- SME administrators and financial users accessing dashboards simultaneously
- Increased authentication requests at beginning of workdays

Potential risks:
- Authentication latency caused by external identity providers
- MFA delays from Microsoft enterprise accounts
- Network congestion during peak hours

Mitigation strategy:
- Frontend loading states and retry mechanisms
- Session caching
- Configurable timeout policies

### Integration Strategy

Authentication Flow:
1. User selects "Continue with Microsoft"
2. Frontend redirects user to Auth0 Universal Login
3. Auth0 federates authentication with Microsoft
4. Identity provider authenticates the user
5. Auth0 returns authorization code to QuietWealth backend
6. Backend exchanges authorization code for tokens
7. Backend validates JWT and ID Token
8. User profile is created or updated internally
9. Internal JWT session is generated
10. User gains access to the SME financial trust platform

### Object-Oriented Design Patterns Required

#### Facade Pattern
Used to abstract all third-party authentication providers behind a single authentication interface.

Example:
- AuthFacade.authenticateUser()

#### DTOs (Data Transfer Objects)
Used for authentication request and response encapsulation.

DTO examples:
- AuthRequestDTO
- AuthResponseDTO
- UserSessionDTO
- ExternalProfileDTO

---

## References

- Auth0 Documentation  
https://auth0.com/docs

- OAuth 2.0 Framework  
https://datatracker.ietf.org/doc/html/rfc6749

- Microsoft Entra ID Documentation  
https://learn.microsoft.com/en-us/entra/
