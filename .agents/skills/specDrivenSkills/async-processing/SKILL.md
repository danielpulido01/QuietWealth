---
name: async-processing
description: Use when implementing async document processing flows in QuietWealth — file upload, Blob Storage, Event Grid, Queue Storage, Azure Functions, status tracking, and notifications.
---

# QuietWealth Async Document Processing Skill

## Flow Overview

```
1. API accepts file upload → stores in Azure Blob Storage
2. Blob Storage emits Event Grid event
3. Queue message created in Azure Queue Storage
4. Azure Function (queue trigger) processes the document
5. Status updated in Azure SQL
6. Notification sent via Azure Notification Hubs
7. Application Insights telemetry across all steps
```

**Rule:** The API must return immediately with an `accepted` status. Never do heavy processing inside the HTTP request.

---

## Step 1 – Upload API (Controller + Service)

```csharp
// Controller — accept and return fast
[HttpPost("upload")]
[ProducesResponseType(typeof(ApiResponse<UploadAcceptedResponse>), StatusCodes.Status202Accepted)]
public async Task<ActionResult<ApiResponse<UploadAcceptedResponse>>> UploadAsync(
    IFormFile file,
    CancellationToken cancellationToken)
{
    var response = await documentService.AcceptUploadAsync(file, cancellationToken);
    var correlationId =
        HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
        ?? HttpContext.TraceIdentifier;

    return Accepted(new ApiResponse<UploadAcceptedResponse>(response, correlationId));
}
```

```csharp
// Service — store blob + create SQL record + publish queue message
public async Task<UploadAcceptedResponse> AcceptUploadAsync(IFormFile file, CancellationToken ct)
{
    var documentId = Guid.NewGuid();
    var blobName = $"{documentId}/{file.FileName}";

    // 1. Store file in Blob Storage
    await blobRepository.UploadAsync("documents", blobName, file.OpenReadStream());

    // 2. Create SQL record with initial status
    await documentRepository.CreateAsync(new Document
    {
        Id = documentId,
        BlobName = blobName,
        Status = DocumentStatus.Pending,
        OriginalFileName = file.FileName
    }, ct);

    // 3. Publish queue message for async processing
    await outboxPublisher.PublishAsync(new OutboxMessage
    {
        Type = "document.processing_requested",
        Payload = JsonSerializer.Serialize(new { DocumentId = documentId, BlobName = blobName })
    }, ct);

    return new UploadAcceptedResponse(documentId, DocumentStatus.Pending);
}
```

---

## Step 2 – Document Status Table

```sql
CREATE TABLE documents (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID()         PRIMARY KEY,
    user_id             UNIQUEIDENTIFIER    NOT NULL    REFERENCES users(id),
    blob_name           NVARCHAR(512)       NOT NULL,
    original_file_name  NVARCHAR(256)       NOT NULL,
    status              NVARCHAR(64)        NOT NULL    DEFAULT 'pending',
    error_message       NVARCHAR(MAX)       NULL,
    retry_count         INT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2           NOT NULL    DEFAULT GETUTCDATE(),
    processed_at        DATETIME2           NULL
);

CREATE INDEX IX_documents_user_id ON documents(user_id);
CREATE INDEX IX_documents_status  ON documents(status);
```

**Status values:** `pending` → `processing` → `completed` | `failed`

---

## Step 3 – Queue Message Shape

```csharp
// Keep queue messages minimal — only identifiers, no file content
public sealed record DocumentProcessingMessage
{
    public Guid DocumentId { get; init; }
    public string BlobName { get; init; } = string.Empty;
    public string CorrelationId { get; init; } = string.Empty;
    public int AttemptNumber { get; init; } = 1;
    public DateTimeOffset EnqueuedAt { get; init; } = DateTimeOffset.UtcNow;
}
```

---

## Step 4 – Azure Function (Queue Trigger)

```csharp
public class DocumentProcessingFunction(
    IDocumentRepository documentRepository,
    IAzureBlobClientFactory blobClientFactory,
    INotificationService notificationService,
    TelemetryClient telemetry)
{
    [Function("ProcessDocument")]
    public async Task Run(
        [QueueTrigger("document-processing")] DocumentProcessingMessage message,
        FunctionContext context)
    {
        telemetry.TrackEvent("DocumentProcessingStarted", new Dictionary<string, string>
        {
            ["documentId"] = message.DocumentId.ToString(),
            ["correlationId"] = message.CorrelationId,
            ["attempt"] = message.AttemptNumber.ToString()
        });

        try
        {
            // Mark as processing (idempotent check)
            var document = await documentRepository.GetByIdAsync(message.DocumentId);
            if (document is null || document.Status == DocumentStatus.Completed)
                return; // already processed or not found — safe to skip

            await documentRepository.UpdateStatusAsync(message.DocumentId, DocumentStatus.Processing);

            // Download and process from Blob
            var blobClient = blobClientFactory.GetContainerClient("documents");
            var stream = await blobClient.GetBlobClient(message.BlobName).OpenReadAsync();

            // ... process the document ...

            // Mark completed
            await documentRepository.UpdateStatusAsync(message.DocumentId, DocumentStatus.Completed);

            // Notify user only after durable state is updated
            await notificationService.SendAsync(document.UserId.ToString(),
                "Document processed", "Your document is ready.");

            telemetry.TrackEvent("DocumentProcessingCompleted", new Dictionary<string, string>
            {
                ["documentId"] = message.DocumentId.ToString(),
                ["correlationId"] = message.CorrelationId
            });
        }
        catch (Exception ex)
        {
            await documentRepository.UpdateStatusAsync(
                message.DocumentId, DocumentStatus.Failed, ex.Message);

            telemetry.TrackException(ex, new Dictionary<string, string>
            {
                ["documentId"] = message.DocumentId.ToString(),
                ["correlationId"] = message.CorrelationId,
                ["attempt"] = message.AttemptNumber.ToString()
            });

            throw; // rethrow so Azure Functions retries the message
        }
    }
}
```

---

## Step 5 – Status Polling API

```csharp
// GET /api/documents/{id}/status
[HttpGet("{id}/status")]
[ProducesResponseType(typeof(ApiResponse<DocumentStatusResponse>), StatusCodes.Status200OK)]
public async Task<ActionResult<ApiResponse<DocumentStatusResponse>>> GetStatusAsync(
    Guid id, CancellationToken cancellationToken)
{
    var document = await documentService.GetStatusAsync(id, cancellationToken);
    var correlationId =
        HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
        ?? HttpContext.TraceIdentifier;

    return Ok(new ApiResponse<DocumentStatusResponse>(document, correlationId));
}
```

---

## Idempotency Rules

- Always check current status before transitioning — never regress (`completed` → `processing`)
- Duplicate queue messages must produce the same end state
- Use `retry_count` in SQL to track retry attempts
- After max retries, mark as `failed` and stop retrying

## Close-Out Checklist

- [ ] API returns `202 Accepted` immediately, never blocks on processing
- [ ] Blob stores file content, SQL stores only metadata and status
- [ ] Queue message contains only identifiers and `correlationId`, no file content
- [ ] Azure Function is idempotent — safe to reprocess same message
- [ ] Status transitions are validated before updating
- [ ] Notifications sent only after SQL status is durably updated
- [ ] `correlationId` present in all steps: HTTP → Blob → Queue → Function → SQL → Notification
- [ ] Telemetry tracks Started + Completed + Failed at Function level
