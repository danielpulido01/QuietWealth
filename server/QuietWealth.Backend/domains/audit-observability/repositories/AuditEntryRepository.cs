using QuietWealth.Bakend.Domains.AuditObservability.Models;

namespace QuietWealth.Bakend.Domains.AuditObservability.Repositories;

public sealed class AuditEntryRepository : IAuditEntryRepository
{
    public Task<IReadOnlyCollection<AuditEntry>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
