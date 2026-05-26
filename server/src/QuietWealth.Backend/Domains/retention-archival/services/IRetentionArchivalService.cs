using DUA.Backend.Domains.RetentionArchival.Models;

namespace DUA.Backend.Domains.RetentionArchival.Services;

public interface IRetentionArchivalService
{
    Task<ArchiveRecordsResponse> ArchiveAsync(ArchiveRecordsRequest request, CancellationToken cancellationToken = default);
}
