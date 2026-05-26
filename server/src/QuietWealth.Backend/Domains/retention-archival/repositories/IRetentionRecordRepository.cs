using DUA.Backend.Domains.RetentionArchival.Models;

namespace DUA.Backend.Domains.RetentionArchival.Repositories;

public interface IRetentionRecordRepository
{
    Task<IReadOnlyCollection<RetentionRecord>> ListCandidatesAsync(DateTimeOffset archiveBeforeUtc, CancellationToken cancellationToken = default);
}
