namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record DocumentBatch(
    Guid DocumentBatchId,
    Guid GenerationSessionId,
    Guid OwnerUserId,
    IReadOnlyCollection<SourceDocument> Documents,
    string Status,
    DateTimeOffset CreatedAtUtc);
