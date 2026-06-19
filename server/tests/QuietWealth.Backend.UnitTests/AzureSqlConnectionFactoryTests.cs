using FluentAssertions;
using Microsoft.Extensions.Options;
using QuietWealth.Bakend.Shared.Configuration;
using QuietWealth.Bakend.Shared.Errors;
using QuietWealth.Bakend.Shared.Infrastructure;

namespace QuietWealth.Backend.UnitTests;

public sealed class AzureSqlConnectionFactoryTests
{
    [Fact]
    public void GetConfiguredConnectionString_returns_bound_option_value()
    {
        var options = Options.Create(new AzureSqlOptions
        {
            ConnectionString = "Server=localhost,14333;Database=QuietWealthTestDb;"
        });

        var sut = new AzureSqlConnectionFactory(options);

        sut.GetConfiguredConnectionString().Should().Be("Server=localhost,14333;Database=QuietWealthTestDb;");
    }

    [Fact]
    public void GetConfiguredConnectionString_throws_infrastructure_exception_when_value_is_missing()
    {
        var options = Options.Create(new AzureSqlOptions
        {
            ConnectionString = string.Empty
        });

        var sut = new AzureSqlConnectionFactory(options);

        var act = () => sut.GetConfiguredConnectionString();

        var exception = act.Should().Throw<InfrastructureException>();
        exception.Which.ErrorCode.Should().Be("infrastructure.azure_sql_unavailable");
        exception.Which.Retryable.Should().BeTrue();
    }
}
