---
name: observability
description: Use when adding telemetry, logging, alerts, or distributed tracing to QuietWealth. Includes exact Application Insights patterns with correlationId propagation across all layers.
---

# QuietWealth Observability Skill

## Stack
- Azure Application Insights
- `CorrelationIdMiddleware` for request tracing
- Structured logging (no plain text logs)
- `correlationId` required on every request and async message

---

## CorrelationId – How It Works

The `CorrelationIdMiddleware` is already registered globally. It attaches a `correlationId` to every request.

**Access in controller:**
```csharp
var correlationId =
    HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
    ?? HttpContext.TraceIdentifier;

return Ok(new ApiResponse<ResponseDto>(result, correlationId));
```

**Pass downstream (to services/repositories):**
```csharp
// When calling external services or publishing messages, always include correlationId
await outboxPublisher.PublishAsync(new OutboxMessage
{
    Type = "domain.event",
    CorrelationId = correlationId,
    Payload = JsonSerializer.Serialize(payload)
}, cancellationToken);
```

---

## Application Insights – Custom Events

```csharp
using Microsoft.ApplicationInsights;

// Inject TelemetryClient via DI
public sealed class <Name>Service(
    I<Name>Repository repository,
    TelemetryClient telemetry) : I<Name>Service
{
    public async Task<Result> <Action>Async(Request request, CancellationToken ct = default)
    {
        // Track business event
        telemetry.TrackEvent("<Domain><Action>Started", new Dictionary<string, string>
        {
            ["correlationId"] = request.CorrelationId ?? "unknown",
            ["userId"] = request.UserId.ToString(),
            ["entityId"] = request.Id.ToString()
        });

        try
        {
            var result = await repository.GetByIdAsync(request.Id, ct);

            telemetry.TrackEvent("<Domain><Action>Completed", new Dictionary<string, string>
            {
                ["correlationId"] = request.CorrelationId ?? "unknown",
                ["userId"] = request.UserId.ToString(),
                ["durationMs"] = stopwatch.ElapsedMilliseconds.ToString()
            });

            return result;
        }
        catch (Exception ex)
        {
            telemetry.TrackException(ex, new Dictionary<string, string>
            {
                ["correlationId"] = request.CorrelationId ?? "unknown",
                ["operation"] = "<Domain>.<Action>",
                ["userId"] = request.UserId.ToString()
            });
            throw;
        }
    }
}
```

---

## Custom Metrics

```csharp
// Track a metric (e.g. document processing time)
telemetry.TrackMetric("<Domain>.<Action>.DurationMs", stopwatch.ElapsedMilliseconds, 
    new Dictionary<string, string>
    {
        ["status"] = "success",
        ["entityType"] = "<entity>"
    });

// Track dependency call
telemetry.TrackDependency(
    dependencyTypeName: "Azure SQL",
    dependencyName: "QuietWealthDb",
    data: "SELECT * FROM <table> WHERE id = @Id",
    startTime: DateTimeOffset.UtcNow,
    duration: stopwatch.Elapsed,
    success: true);
```

---

## What to Track Per Layer

### Controller layer
```csharp
// Already handled by Application Insights auto-instrumentation
// Just ensure correlationId is in the response
```

### Service layer
```csharp
// Track business events:
// - <Domain><Action>Started    → when operation begins
// - <Domain><Action>Completed  → on success with duration
// - <Domain><Action>Failed     → on business rule failure
```

### Repository layer
```csharp
// Track infrastructure events:
// - Azure SQL calls via TrackDependency
// - Blob Storage calls via TrackDependency
// - Redis calls via TrackDependency
```

### Async processing (Azure Functions)
```csharp
// Always propagate correlationId from queue message
// Track: FunctionStarted, FunctionCompleted, FunctionFailed
// Include: correlationId, documentId, queueMessageId, attemptNumber
```

---

## Logging Rules

```csharp
// Structured log with context
_logger.LogInformation("Password reset requested for user {UserId} correlation {CorrelationId}",
    userId, correlationId);

// Error with classification
_logger.LogError(ex, "Password reset failed for user {UserId} error {ErrorCode}",
    userId, ex is AppException appEx ? appEx.ErrorCode : "unknown");

// Never log sensitive data
_logger.LogInformation("User {Email} reset password");        //  wrong: email is PII
_logger.LogInformation("Token: {Token}", resetToken);         //  never log tokens
_logger.LogInformation("Password changed to {Password}");     //  never log passwords
```

---

## Alert Rules to Define

| Alert | Condition | Severity |
|---|---|---|
| High error rate | API error rate > 5% in 5 min | High |
| Slow responses | P95 response time > 2000ms | Medium |
| Failed password resets | Reset failures > 10/min per IP | High (brute force) |
| SQL unavailable | `InfrastructureException` count > 5/min | Critical |
| Queue backlog | Queue depth > 100 messages | Medium |

---

## Health Check Pattern

```csharp
// In QuietWealthHealthChecks extension:
services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "azure-sql", tags: ["ready"])
    .AddRedis(redisConnection, name: "redis", tags: ["ready"])
    .AddAzureBlobStorage(blobConnection, name: "blob-storage", tags: ["ready"]);

// Endpoints already configured:
// GET /health/live  → liveness (is the process running?)
// GET /health/ready → readiness (can it serve traffic?)
```

## Close-Out Checklist

- [ ] Every request has `correlationId` in response
- [ ] Business events tracked: Started + Completed + Failed
- [ ] No PII, tokens, or passwords in logs
- [ ] Structured logging used (no plain text)
- [ ] `correlationId` propagated to async messages
- [ ] Infrastructure calls tracked as dependencies
- [ ] Alert rules defined for new failure modes
