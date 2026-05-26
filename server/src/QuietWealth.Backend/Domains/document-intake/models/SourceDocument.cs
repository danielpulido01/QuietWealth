namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record SourceDocument(
    Guid SourceDocumentId,
    string FileName,
    string ContentType,
    string UploadStatus,
    string? BlobPath,
    string? Checksum);
