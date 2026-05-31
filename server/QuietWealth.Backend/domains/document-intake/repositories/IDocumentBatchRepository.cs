using QuietWealth.Bakend.Domains.DocumentIntake.Models;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Repositories;

public interface IDocumentBatchRepository
{
    Task<IReadOnlyCollection<DocumentBatch>> ListAsync(CancellationToken cancellationToken = default);
}
