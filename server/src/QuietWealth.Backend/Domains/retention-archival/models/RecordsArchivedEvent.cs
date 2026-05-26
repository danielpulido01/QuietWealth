using DUA.Backend.Shared.Abstractions;

namespace DUA.Backend.Domains.RetentionArchival.Models;

public sealed record RecordsArchivedEvent(Guid RetentionRecordId, DateTimeOffset OccurredAtUtc) : IDomainEvent
{
    public string EventName => "RecordsArchived";
}
