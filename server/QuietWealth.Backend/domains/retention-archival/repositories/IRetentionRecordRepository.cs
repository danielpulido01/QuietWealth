using QuietWealth.Backend.Domains.RetentionArchival.Models;

namespace QuietWealth.Backend.Domains.RetentionArchival.Repositories;

public interface IRetentionRecordRepository
{
    Task<IReadOnlyCollection<RetentionRecord>> ListCandidatesAsync(DateTimeOffset archiveBeforeUtc, CancellationToken cancellationToken = default);
}
