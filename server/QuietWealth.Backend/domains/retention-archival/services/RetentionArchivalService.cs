using QuietWealth.Backend.Domains.RetentionArchival.Models;
using QuietWealth.Backend.Domains.RetentionArchival.Repositories;

namespace QuietWealth.Backend.Domains.RetentionArchival.Services;

public sealed class RetentionArchivalService : IRetentionArchivalService
{
    private readonly IRetentionRecordRepository retentionRecordRepository;

    public RetentionArchivalService(IRetentionRecordRepository retentionRecordRepository)
    {
        ArgumentNullException.ThrowIfNull(retentionRecordRepository);
        this.retentionRecordRepository = retentionRecordRepository;
    }

    public async Task<ArchiveRecordsResponse> ArchiveAsync(ArchiveRecordsRequest request, CancellationToken cancellationToken = default)
    {
        var candidates = await retentionRecordRepository.ListCandidatesAsync(request.ArchiveBeforeUtc, cancellationToken);
        return new ArchiveRecordsResponse(candidates.Count, "Accepted");
    }
}
