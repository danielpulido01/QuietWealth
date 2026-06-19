using QuietWealth.Backend.Domains.RetentionArchival.Models;

namespace QuietWealth.Backend.Domains.RetentionArchival.Repositories;

public sealed class RetentionRecordRepository : IRetentionRecordRepository
{
    public Task<IReadOnlyCollection<RetentionRecord>> ListCandidatesAsync(DateTimeOffset archiveBeforeUtc, CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyCollection<RetentionRecord>>(Array.Empty<RetentionRecord>());
}
