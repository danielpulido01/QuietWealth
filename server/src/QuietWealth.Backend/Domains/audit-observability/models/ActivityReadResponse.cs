namespace QuietWealth.Bakend.Domains.AuditObservability.Models;

public sealed record ActivityReadResponse(IReadOnlyCollection<AuditEntry> Entries);
