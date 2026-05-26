namespace DUA.Backend.Domains.RetentionArchival.Models;

public sealed record RetentionRecord(Guid RetentionRecordId, Guid ArtifactId, string LifecycleStatus, string ArchivePath);
