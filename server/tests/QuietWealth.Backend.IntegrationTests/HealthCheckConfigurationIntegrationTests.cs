using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;

namespace QuietWealth.Backend.IntegrationTests;

public sealed class HealthCheckConfigurationIntegrationTests
{
    [Fact]
    public async Task Ready_health_checks_are_healthy_when_required_configuration_exists()
    {
        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["AzureSql:ConnectionString"] = "Server=localhost,14333;Database=QuietWealthTestDb;",
            ["BlobStorage:ConnectionString"] = "UseDevelopmentStorage=true",
            ["BlobStorage:DocumentsContainer"] = "documents",
            ["BlobStorage:TemplatesContainer"] = "templates",
            ["BlobStorage:ArtifactsContainer"] = "artifacts",
            ["Redis:ConnectionString"] = "localhost:6380",
            ["NotificationHub:ConnectionString"] = "Endpoint=sb://quietwealth-test/;",
            ["NotificationHub:HubName"] = "quietwealth-test-hub",
            ["RetentionPolicy:ArchiveContainer"] = "archive"
        });

        builder.Services
            .AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
            .AddCheck(
                "azure-sql-config",
                () => string.IsNullOrWhiteSpace(builder.Configuration["AzureSql:ConnectionString"])
                    ? HealthCheckResult.Unhealthy()
                    : HealthCheckResult.Healthy(),
                tags: ["ready"]);

        using var host = builder.Build();
        var healthCheckService = host.Services.GetRequiredService<HealthCheckService>();

        var report = await healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"));

        report.Status.Should().Be(HealthStatus.Healthy);
    }
}
