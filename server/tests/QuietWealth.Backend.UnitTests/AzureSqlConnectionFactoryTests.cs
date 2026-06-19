using FluentAssertions;
using Microsoft.Extensions.Options;
using QuietWealth.Bakend.Shared.Configuration;
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
}
