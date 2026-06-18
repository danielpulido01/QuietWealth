---
name: quietwealth-backend-api
description: Guide QuietWealth REST API work in ASP.NET Core. Use when creating or reviewing controllers, endpoints, DTOs, services, validation, OpenAPI contracts, or integrations with Azure SQL, Blob Storage, Redis, Queue Storage, Auth0, Microsoft Entra ID, and Application Insights.
---

# QuietWealth Backend API

## Overview

Build REST APIs as thin HTTP surfaces over domain services and repositories. Keep transport contracts explicit, validation consistent, telemetry correlated, and security appropriate for financial data.

Open these areas first before changing the API shape:

- `server/QuietWealth.Backend/domains/`
- `server/QuietWealth.Backend/shared/Api/`
- `server/QuietWealth.Backend/shared/Infrastructure/`
- `server/QuietWealth.Backend/shared/Configuration/`

## Workflow

1. Identify the domain that owns the endpoint and keep the route in that slice.
2. Define request and response DTOs separately from domain models.
3. Keep controllers limited to:
   - binding inputs
   - enforcing auth attributes and policies
   - translating service results to HTTP status codes
4. Place use-case orchestration in services and persistence access behind repository contracts.
5. Validate request input before business execution and return consistent validation failures.
6. Use shared response shapes and error contracts so success and failure payloads stay predictable.
7. Update Swagger or OpenAPI metadata whenever request shape, response shape, auth requirements, or error cases change.
8. Add or preserve telemetry with `correlationId`, trace context, and Application Insights coverage across downstream dependencies.

## Rules

- Serve APIs over HTTPS only.
- Keep controllers thin. Do not place business rules, SQL, blob SDK logic, Redis access, or queue publishing directly inside controllers.
- Separate controllers, services, repositories, and DTOs even for small endpoints.
- Validate input consistently with ASP.NET Core model validation or equivalent validators before calling services.
- Return consistent response shapes. Reuse shared API response and error patterns where available, including `correlationId`.
- Map domain and infrastructure failures to stable HTTP responses instead of leaking raw exceptions.
- Do not expose secrets, internal stack traces, tokens, or sensitive financial payloads in responses or logs.
- Use Auth0 or Microsoft Entra ID deliberately per integration boundary. Do not leave auth assumptions implicit.
- Route Azure SQL, Blob Storage, Redis, and Queue Storage access through repositories or infrastructure adapters, not through controller code.
- Emit meaningful Application Insights telemetry for requests, dependencies, failures, and long-running operations.
- Preserve cancellation-token flow on async endpoints and downstream calls.

## Required Output

When this skill is used, document:

- `Hallazgos y Correcciones sugeridas`
- `Correcciones aplicadas`

Call out:

- endpoint ownership
- DTO and validation changes
- auth model
- error/response consistency
- telemetry and `correlationId`

## Close-Out Checklist

- Confirm the route, DTOs, and service contract all describe the same use case.
- Confirm Swagger or OpenAPI docs reflect the real request, response, and auth behavior.
- Confirm `correlationId` is present in success and error paths.
- Confirm financial or identity-related fields are not overexposed in API payloads.
- Confirm infrastructure dependencies remain behind service and repository seams.
