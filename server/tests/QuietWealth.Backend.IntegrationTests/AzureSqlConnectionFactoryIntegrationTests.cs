using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using QuietWealth.Bakend.Shared.Configuration;
using QuietWealth.Bakend.Shared.Infrastructure;

namespace QuietWealth.Backend.IntegrationTests;

public sealed class AzureSqlConnectionFactoryIntegrationTests
{
    [Fact]
    public void Factory_reads_connection_string_from_bound_configuration()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [$"{AzureSqlOptions.SectionName}:ConnectionString"] =
                    "Server=localhost,14333;Database=QuietWealthTestDb;User Id=sa;Password=QuietWealth_Test_123!;"
            })
            .Build();

        var services = new ServiceCollection();
        services.Configure<AzureSqlOptions>(configuration.GetSection(AzureSqlOptions.SectionName));
        services.AddSingleton<IAzureSqlConnectionFactory, AzureSqlConnectionFactory>();

        using var provider = services.BuildServiceProvider();

        var factory = provider.GetRequiredService<IAzureSqlConnectionFactory>();

        factory.GetConfiguredConnectionString().Should().Contain("Server=localhost,14333");
    }
}
