---
name: quietwealth-observability
description: Use when implementing or reviewing QuietWealth observability across the frontend, backend, and Azure services. Focuses on structured, correlation-aware telemetry in Application Insights, safe logging without sensitive data, end-to-end tracing of async document workflows, and operational coverage through alerts, dashboards, and diagnostic context.
user-invocable: true
---

# QuietWealth Observability Skill

Use this skill when working on telemetry, logging, monitoring, error analysis, distributed tracing, alerts, dashboards, or production diagnostics.

## Project context

The system uses:

- Next.js SSR frontend hosted on Azure App Service
- ASP.NET Core backend hosted on Azure App Service
- Azure API Management
- Azure SQL Database
- Azure Blob Storage
- Azure Event Grid
- Azure Queue Storage
- Azure Functions
- Azure Managed Redis
- Azure Notification Hubs
- Azure Application Insights

## Rules

- Every request must propagate a `correlationId`.
- Frontend, SSR, backend API, Azure Functions, and queue-processing logs must include the same `correlationId` when they belong to the same business transaction.
- Never log access tokens, refresh tokens, passwords, financial secrets, or sensitive document contents.
- Log business events at a useful level, but avoid logging full financial payloads.
- Use structured logs instead of plain text logs.
- Include enough context to diagnose failures: user/session reference, operation name, document id, queue message id, status, duration, and error category.
- Use Application Insights for traces, requests, dependencies, exceptions, and performance metrics.
- Add alerts for high error rate, queue backlog, failed document processing, slow API responses, and Azure Function failures.
- For async document processing, track the full flow:
  1. document uploaded to Blob Storage
  2. Event Grid event emitted
  3. queue message created
  4. Azure Function started
  5. document processed
  6. status updated in Azure SQL
  7. notification sent

## Expected output

When reviewing or generating code, verify:

- logs are structured
- sensitive data is not logged
- `correlationId` is present
- errors are classified
- failures are observable from Application Insights
- async flows can be traced end-to-end
- alerts or dashboard metrics are documented when relevant