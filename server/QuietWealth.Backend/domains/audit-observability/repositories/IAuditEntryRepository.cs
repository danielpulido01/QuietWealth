using QuietWealth.Bakend.Domains.AuditObservability.Models;

namespace QuietWealth.Bakend.Domains.AuditObservability.Repositories;

public interface IAuditEntryRepository
{
    Task<IReadOnlyCollection<AuditEntry>> ListAsync(CancellationToken cancellationToken = default);
}
