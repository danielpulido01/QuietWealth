using QuietWealth.Bakend.Domains.AuditObservability.Models;

namespace QuietWealth.Bakend.Domains.AuditObservability.Services;

public interface IAuditObservabilityService
{
    Task<ActivityReadResponse> ReadActivityAsync(CancellationToken cancellationToken = default);
}
