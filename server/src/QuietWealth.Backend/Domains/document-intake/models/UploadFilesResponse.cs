namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record UploadFilesResponse(Guid DocumentBatchId, string Status);
