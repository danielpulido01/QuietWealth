# Architecture README Validation

Date: 2026-06-19
Reviewer: Codex
Requested agent: `architectural_validation_reviewer`
Execution note: The specialized agent could not run in this session because it is pinned to `gpt-5.1-codex`, which was not available in the current account context. The review below was completed manually against the repository contents.

## Scope

Validate whether the architecture documented in `README.md` matches the current implementation in:

- `app/`
- `server/`
- `infra/`
- `.github/workflows/`

## Verdict

`README.md` does not match the current codebase if read as a current-state architecture document.

The document mixes:

- a target production Azure architecture
- a partial backend scaffold
- a local MVP implementation

Those three states are not clearly separated, and several sections present target architecture as if it were already the active runtime.

## Findings

### 1. Production Azure runtime is documented as implemented, but the actual runtime is a local in-memory MVP

The README documents an Azure production architecture with:

- Azure API Management and App Service
- Azure SQL Database
- Azure Blob Storage
- Azure Event Grid
- Azure Queue Storage
- Azure Functions
- Azure Notification Hubs

References:

- `README.md:1067`
- `README.md:1068`
- `README.md:1069`
- `README.md:1073`
- `README.md:1074`

The actual backend runtime is a local in-memory MVP:

- `LocalMvpStore` is registered as a singleton in `server/QuietWealth.Backend/Program.cs:14`
- health endpoints return a fixed payload with `mode = "local-mvp"` in `server/QuietWealth.Backend/Program.cs:27`
- local demo controllers are defined inline in `server/QuietWealth.Backend/Program.cs:57`
- marketplace endpoints are inline in `server/QuietWealth.Backend/Program.cs:66`
- local file endpoints are inline in `server/QuietWealth.Backend/Program.cs:73`
- validation endpoints are inline in `server/QuietWealth.Backend/Program.cs:82`

The README later acknowledges the local MVP explicitly:

- `README.md:3823`
- `README.md:3862`

This makes the README internally inconsistent.

### 2. Backend bounded-context structure in the README is broader than the implemented API surface

The README describes additional backend domains and flows such as:

- `Marketplace`
- `CertificationValidation`
- richer controller/service/facade boundaries

References:

- `README.md:2358`
- `README.md:2359`
- `README.md:2451`
- `README.md:2650`
- `README.md:2652`

The implemented domain folders currently present are:

- `server/QuietWealth.Backend/domains/identity-access`
- `server/QuietWealth.Backend/domains/document-intake`
- `server/QuietWealth.Backend/domains/retention-archival`
- `server/QuietWealth.Backend/domains/audit-observability`

There is no `domains/marketplace` or `domains/certification-validation` folder in the backend implementation. Current marketplace and validation behavior for the local MVP is implemented inline in `Program.cs` rather than in those documented domain modules.

### 3. Frontend authentication architecture in the README does not match the active implementation

The README says the frontend uses Auth0 React SDK with PKCE and Microsoft login via Auth0:

- `README.md:32`
- `README.md:52`
- `README.md:563`

The active routed frontend uses the local MVP session flow:

- `app/src/routes/AppRouter.tsx:61` uses `useDemoSession()`
- `app/src/components/hooks/useDemoSession.ts:16` logs in through `localMvpService`
- `app/src/services/localMvpService.ts:79` calls `/api/local-auth/login`

Also, `app/package.json` does not include an Auth0 SDK dependency.

There is auth-related code aimed at a fuller backend API in:

- `app/src/auth/authService.ts`
- `app/src/auth/AuthProvider.tsx`

But the currently wired application router is based on the local demo session flow, not the Auth0 architecture described in the README.

### 4. Health-check architecture is documented as dependency-aware, but implementation is static

The README requires dependency-specific health checks for SQL, Blob, Queue, Redis, and Notification Hubs:

- `README.md:1086`

The actual implementation maps both health endpoints with `Predicate = _ => false` and returns a constant healthy payload:

- `server/QuietWealth.Backend/Program.cs:20`
- `server/QuietWealth.Backend/Program.cs:21`
- `server/QuietWealth.Backend/Program.cs:27`

That does not match the documented readiness model.

### 5. Frontend path references in the README are stale

The README repeatedly links to paths such as:

- `/app/components/atoms`
- `/app/components/hooks`
- `/app/components/styles`
- `/app/components/i18n`

References:

- `README.md:225`
- `README.md:344`
- `README.md:369`
- `README.md:435`
- `README.md:775`

The actual code lives under `app/src/components/...`, not `app/components/...`.

Example:

- actual folder: `app/src/components`
- missing folder: `app/components`

### 6. Frontend build/deployment wording is stale

The README says environment variables are baked into the "Next.js bundle":

- `README.md:1193`

The frontend is built with Vite:

- `app/package.json:7` => `vite build`

That part of the documentation is outdated.

## What Does Match

### 1. Partial backend scaffold exists and roughly follows the documented domain-first structure

Examples:

- `server/QuietWealth.Backend/domains/identity-access/controllers/IdentityAccessController.cs`
- `server/QuietWealth.Backend/domains/document-intake/services/DocumentIntakeService.cs`
- `server/QuietWealth.Backend/domains/document-intake/repositories/DocumentBatchRepository.cs`

### 2. Azure target infrastructure is represented in IaC

The production architecture described in the README is not fictional; it is represented in Bicep under `infra/`.

Examples in `infra/modules/services.bicep`:

- Application Insights: `:81`
- Storage account: `:96`
- SQL Server and database: `:175`, `:200`
- Redis: `:216`
- Event Grid: `:236`
- Notification Hubs: `:262`, `:276`
- API Management: `:282`
- Frontend App Service: `:317`
- API App Service: `:384`
- Function App: `:526`

### 3. CI/test structure is broadly aligned

The repository includes the backend and frontend workflow structure described in the README, including dedicated CI workflows and backend test projects.

Examples:

- `.github/workflows/ci-backend.yml`
- `.github/workflows/ci-frontend.yml`
- `server/tests/QuietWealth.Backend.UnitTests`
- `server/tests/QuietWealth.Backend.IntegrationTests`
- `server/tests/QuietWealth.Backend.ApiTests`
- `server/tests/QuietWealth.Backend.ContractTests`

## Recommended Documentation Fix

Split `README.md` into clearly labeled sections:

1. Current implemented local MVP architecture
2. Partial scaffold already present in code
3. Target production Azure architecture

At minimum, the top-level architecture sections should explicitly state whether they are:

- implemented now
- partially scaffolded
- planned target state

Without that separation, the README overstates what the current runtime actually does.
