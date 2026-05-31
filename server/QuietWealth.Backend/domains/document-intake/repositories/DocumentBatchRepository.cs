using QuietWealth.Bakend.Domains.DocumentIntake.Models;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Repositories;

public sealed class DocumentBatchRepository : IDocumentBatchRepository
{
    public Task<IReadOnlyCollection<DocumentBatch>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
