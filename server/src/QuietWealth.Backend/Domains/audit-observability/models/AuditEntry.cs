namespace QuietWealth.Bakend.Domains.AuditObservability.Models;

public sealed record AuditEntry(Guid AuditEntryId, string EventName, string CorrelationId, DateTimeOffset OccurredAtUtc);
