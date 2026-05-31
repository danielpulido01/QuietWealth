namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record UploadFilesRequest(
    Guid GenerationSessionId,
    Guid OwnerUserId,
    IReadOnlyCollection<string> FileNames);
