using QuietWealth.Backend.Domains.RetentionArchival.Models;

namespace QuietWealth.Backend.Domains.RetentionArchival.Services;

public interface IRetentionArchivalService
{
    Task<ArchiveRecordsResponse> ArchiveAsync(ArchiveRecordsRequest request, CancellationToken cancellationToken = default);
}
