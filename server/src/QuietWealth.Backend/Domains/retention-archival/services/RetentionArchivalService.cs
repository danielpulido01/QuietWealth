using DUA.Backend.Domains.RetentionArchival.Models;
using DUA.Backend.Domains.RetentionArchival.Repositories;

namespace DUA.Backend.Domains.RetentionArchival.Services;

public sealed class RetentionArchivalService : IRetentionArchivalService
{
    public RetentionArchivalService(IRetentionRecordRepository retentionRecordRepository)
    {
        ArgumentNullException.ThrowIfNull(retentionRecordRepository);
    }

    public Task<ArchiveRecordsResponse> ArchiveAsync(ArchiveRecordsRequest request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
