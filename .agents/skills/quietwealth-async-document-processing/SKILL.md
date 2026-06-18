---
name: quietwealth-async-document-processing
description: Guide QuietWealth asynchronous document-processing flows. Use when working on file upload, Azure Blob Storage events, Event Grid, Queue Storage, Azure Functions, SQL status updates, Notification Hubs, retries, idempotency, or end-to-end observability.
---

# QuietWealth Async Document Processing

## Overview

Design document workflows as durable asynchronous pipelines. The upload API should accept work, persist the minimum required metadata, and hand off processing through Azure messaging components instead of doing heavy work inline.

Treat this as the target flow unless there is a documented exception:

1. file uploaded to Azure Blob Storage
2. Blob Storage emits an Event Grid event
3. a queue message is created in Azure Queue Storage
4. an Azure Function with queue trigger processes the work
5. document status is updated in Azure SQL
6. user-facing notification is sent through Azure Notification Hubs
7. telemetry is emitted to Application Insights across the full path

## Workflow

1. Define the document lifecycle states before wiring infrastructure.
2. Keep the API boundary fast and explicit:
   - accept upload or upload metadata
   - return identifiers and accepted status
   - do not block on downstream processing
3. Persist enough metadata in Azure SQL to track ownership, status, retries, and final outcome.
4. Keep queue messages minimal and versioned. Pass identifiers, blob locations, correlation data, and processing intent, not raw file contents.
5. Implement the Azure Function as an idempotent consumer that can safely reprocess the same message.
6. Update SQL state transitions atomically enough to prevent status regression or duplicate completion side effects.
7. Send notifications only after the durable state reflects the user-visible result.
8. Trace the entire flow with `correlationId`, document IDs, queue message IDs, and failure categories.

## Rules

- Do not perform long-running document processing synchronously inside the API request path.
- Use Blob Storage as the file source of truth and Azure SQL as the workflow and audit source of truth.
- Make Event Grid and queue handoff observable and retry-safe.
- Design queue messages for idempotency. Duplicate delivery must not create duplicate records, duplicate notifications, or invalid status transitions.
- Handle poison-message scenarios explicitly after retry exhaustion.
- Record processing failures with actionable status and error classification, not only free-text messages.
- Emit Application Insights telemetry for upload, enqueue, function execution, dependency calls, failure, and notification dispatch.
- Preserve `correlationId` across HTTP, blob event, queue message, function execution, SQL update, and notification send.
- Keep side effects ordered: durable status first, external notification after.
- Prefer resumable processing over fragile in-memory orchestration.

## Required Output

When this skill is used, document:

- `Hallazgos y Correcciones sugeridas`
- `Correcciones aplicadas`

Call out:

- lifecycle states
- queue payload shape
- idempotency strategy
- retry and poison-message handling
- observability and notification ordering

## Close-Out Checklist

- Confirm the API returns quickly and does not depend on downstream processing to finish.
- Confirm every async handoff carries stable identifiers and `correlationId`.
- Confirm retries cannot duplicate durable state or user notifications.
- Confirm failure states are queryable from Azure SQL and diagnosable from Application Insights.
- Confirm the queue-trigger worker can resume safely after partial failure.
