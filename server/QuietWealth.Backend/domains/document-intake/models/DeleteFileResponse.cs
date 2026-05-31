namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record DeleteFileResponse(Guid SourceDocumentId, string Status);
