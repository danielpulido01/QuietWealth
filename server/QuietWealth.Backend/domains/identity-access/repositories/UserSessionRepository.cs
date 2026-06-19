using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Shared.Errors;
using QuietWealth.Bakend.Shared.Infrastructure;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

public sealed class UserSessionRepository(IAzureSqlConnectionFactory azureSqlConnectionFactory) : IUserSessionRepository
{
    public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _ = azureSqlConnectionFactory.GetConfiguredConnectionString();
            return Task.FromResult<UserSession?>(null);
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
