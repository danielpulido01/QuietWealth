using DUA.Backend.Domains.RetentionArchival.Models;

namespace DUA.Backend.Domains.RetentionArchival.Repositories;

public sealed class RetentionRecordRepository : IRetentionRecordRepository
{
    public Task<IReadOnlyCollection<RetentionRecord>> ListCandidatesAsync(DateTimeOffset archiveBeforeUtc, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
