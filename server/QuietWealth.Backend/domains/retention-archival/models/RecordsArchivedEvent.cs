using QuietWealth.Backend.Shared.Abstractions;

namespace QuietWealth.Backend.Domains.RetentionArchival.Models;

public sealed record RecordsArchivedEvent(Guid RetentionRecordId, DateTimeOffset OccurredAtUtc) : IDomainEvent
{
    public string EventName => "RecordsArchived";
}
