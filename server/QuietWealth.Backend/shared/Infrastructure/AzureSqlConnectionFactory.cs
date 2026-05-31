using QuietWealth.Bakend.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public interface IAzureSqlConnectionFactory
{
    string GetConfiguredConnectionString();
}

public sealed class AzureSqlConnectionFactory(IOptions<AzureSqlOptions> options) : IAzureSqlConnectionFactory
{
    public string GetConfiguredConnectionString() => options.Value.ConnectionString;
}
