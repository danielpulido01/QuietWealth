using QuietWealth.Bakend.Shared.Abstractions;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record FilesUploadRejectedEvent(Guid DocumentBatchId, DateTimeOffset OccurredAtUtc) : IDomainEvent
{
    public string EventName => "FilesUploadRejected";
}
