namespace QuietWealth.Backend.Domains.RetentionArchival.Models;

public sealed record ArchiveRecordsRequest(DateTimeOffset ArchiveBeforeUtc);
