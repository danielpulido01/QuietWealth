using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Shared.Errors;
using QuietWealth.Bakend.Shared.Infrastructure;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Repositories;

public sealed class DocumentBatchRepository(IAzureSqlConnectionFactory azureSqlConnectionFactory) : IDocumentBatchRepository
{
    public Task<IReadOnlyCollection<DocumentBatch>> ListAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _ = azureSqlConnectionFactory.GetConfiguredConnectionString();
            return Task.FromResult<IReadOnlyCollection<DocumentBatch>>(Array.Empty<DocumentBatch>());
        }
        catch (InfrastructureException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new InfrastructureException(
                "The request could not be completed because Azure SQL is unavailable.",
                "infrastructure.azure_sql_unavailable",
                retryable: true,
                innerException: ex);
        }
    }
}
