using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace QuietWealth.Bakend.Shared.Diagnostics;

public static class HealthChecks
{
    private static readonly string[] ReadyTags = ["ready"];
    private static readonly string[] LiveTags = ["live"];

    public static IServiceCollection AddQuietWealthHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy("Process is running."), tags: LiveTags)
            .AddRequiredConfigurationCheck(
                configuration,
                "azure-sql-config",
                "AzureSql:ConnectionString",
                "Azure SQL connection string")
            .AddRequiredConfigurationCheck(
                configuration,
                "blob-storage-config",
                "BlobStorage:ConnectionString",
                "Blob Storage connection string")
            .AddRequiredConfigurationCheck(
                configuration,
                "blob-documents-container-config",
                "BlobStorage:DocumentsContainer",
                "Blob Storage documents container")
            .AddRequiredConfigurationCheck(
                configuration,
                "blob-templates-container-config",
                "BlobStorage:TemplatesContainer",
                "Blob Storage templates container")
            .AddRequiredConfigurationCheck(
                configuration,
                "blob-artifacts-container-config",
                "BlobStorage:ArtifactsContainer",
                "Blob Storage artifacts container")
            .AddRequiredConfigurationCheck(
                configuration,
                "redis-config",
                "Redis:ConnectionString",
                "Redis connection string")
            .AddRequiredConfigurationCheck(
                configuration,
                "notification-hub-connection-config",
                "NotificationHub:ConnectionString",
                "Notification Hub connection string")
            .AddRequiredConfigurationCheck(
                configuration,
                "notification-hub-name-config",
                "NotificationHub:HubName",
                "Notification Hub name")
            .AddRequiredConfigurationCheck(
                configuration,
                "retention-archive-container-config",
                "RetentionPolicy:ArchiveContainer",
                "Retention archive container");

        return services;
    }

    public static HealthCheckOptions CreateLiveEndpointOptions() =>
        new()
        {
            Predicate = registration => registration.Tags.Contains("live"),
            ResponseWriter = WriteResponseAsync
        };

    public static HealthCheckOptions CreateReadyEndpointOptions() =>
        new()
        {
            Predicate = registration => registration.Tags.Contains("ready"),
            ResponseWriter = WriteResponseAsync
        };

    public static Task WriteResponseAsync(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var payload = new
        {
            status = report.Status.ToString(),
            mode = "local-mvp",
            totalDurationMs = Math.Round(report.TotalDuration.TotalMilliseconds, 2),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                durationMs = Math.Round(entry.Value.Duration.TotalMilliseconds, 2),
                data = entry.Value.Data
            })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }

    private static IHealthChecksBuilder AddRequiredConfigurationCheck(
        this IHealthChecksBuilder builder,
        IConfiguration configuration,
        string name,
        string key,
        string description) =>
        builder.AddCheck(
            name,
            () =>
            {
                if (string.IsNullOrWhiteSpace(configuration[key]))
                {
                    return HealthCheckResult.Unhealthy(
                        $"{description} is missing.",
                        data: new Dictionary<string, object>
                        {
                            ["configurationKey"] = key
                        });
                }

                return HealthCheckResult.Healthy(
                    $"{description} is configured.",
                    new Dictionary<string, object>
                    {
                        ["configurationKey"] = key
                    });
            },
            tags: ReadyTags);
}
