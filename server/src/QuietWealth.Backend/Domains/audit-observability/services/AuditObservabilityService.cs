using QuietWealth.Bakend.Domains.AuditObservability.Models;
using QuietWealth.Bakend.Domains.AuditObservability.Repositories;

namespace QuietWealth.Bakend.Domains.AuditObservability.Services;

public sealed class AuditObservabilityService(IAuditEntryRepository auditEntryRepository) : IAuditObservabilityService
{
    public async Task<ActivityReadResponse> ReadActivityAsync(CancellationToken cancellationToken = default)
    {
        var entries = await auditEntryRepository.ListAsync(cancellationToken);
        return new ActivityReadResponse(entries);
    }
}
