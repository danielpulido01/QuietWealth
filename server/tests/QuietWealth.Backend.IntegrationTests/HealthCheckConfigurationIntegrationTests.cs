using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuietWealth.Bakend.Shared.Diagnostics;

namespace QuietWealth.Backend.IntegrationTests;

public sealed class HealthCheckConfigurationIntegrationTests
{
    [Fact]
    public async Task Ready_health_checks_are_healthy_when_required_configuration_exists()
    {
        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.Sources.Clear();
        builder.Logging.ClearProviders();
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

        builder.Services.AddQuietWealthHealthChecks(builder.Configuration);

        using var host = builder.Build();
        var healthCheckService = host.Services.GetRequiredService<HealthCheckService>();

        var report = await healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"));

        report.Status.Should().Be(HealthStatus.Healthy);
        report.Entries.Should().ContainKey("azure-sql-config");
        report.Entries.Should().ContainKey("blob-storage-config");
        report.Entries.Should().ContainKey("redis-config");
        report.Entries.Should().ContainKey("notification-hub-connection-config");
    }

    [Fact]
    public async Task Ready_health_checks_are_unhealthy_when_required_configuration_is_missing()
    {
        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.Sources.Clear();
        builder.Logging.ClearProviders();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["BlobStorage:ConnectionString"] = "UseDevelopmentStorage=true",
            ["BlobStorage:DocumentsContainer"] = "documents",
            ["BlobStorage:TemplatesContainer"] = "templates",
            ["BlobStorage:ArtifactsContainer"] = "artifacts",
            ["Redis:ConnectionString"] = "localhost:6380",
            ["NotificationHub:ConnectionString"] = "Endpoint=sb://quietwealth-test/;",
            ["NotificationHub:HubName"] = "quietwealth-test-hub",
            ["RetentionPolicy:ArchiveContainer"] = "archive"
        });

        builder.Services.AddQuietWealthHealthChecks(builder.Configuration);

        using var host = builder.Build();
        var healthCheckService = host.Services.GetRequiredService<HealthCheckService>();

        var report = await healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"));

        report.Status.Should().Be(HealthStatus.Unhealthy);
        report.Entries["azure-sql-config"].Status.Should().Be(HealthStatus.Unhealthy);
    }
}
