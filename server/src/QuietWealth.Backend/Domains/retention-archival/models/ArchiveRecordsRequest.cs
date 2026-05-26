namespace DUA.Backend.Domains.RetentionArchival.Models;

public sealed record ArchiveRecordsRequest(DateTimeOffset ArchiveBeforeUtc);
