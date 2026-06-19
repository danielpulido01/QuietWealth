using QuietWealth.Bakend.Shared.Configuration;
using QuietWealth.Bakend.Shared.Errors;
using Microsoft.Extensions.Options;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public interface IAzureSqlConnectionFactory
{
    string GetConfiguredConnectionString();
}

public sealed class AzureSqlConnectionFactory(IOptions<AzureSqlOptions> options) : IAzureSqlConnectionFactory
{
    public string GetConfiguredConnectionString()
    {
        try
        {
            var connectionString = options.Value.ConnectionString;

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Azure SQL connection string is missing.");
            }

            return connectionString;
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
