namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record FilesReadResponse(IReadOnlyCollection<DocumentBatch> DocumentBatches);
