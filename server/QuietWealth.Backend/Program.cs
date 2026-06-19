using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using QuietWealth.Bakend.Domains.AuditObservability.Repositories;
using QuietWealth.Bakend.Domains.AuditObservability.Services;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;
using QuietWealth.Bakend.Domains.DocumentIntake.Services;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;
using QuietWealth.Bakend.Shared.Abstractions;
using QuietWealth.Bakend.Shared.Api;
using QuietWealth.Bakend.Shared.Configuration;
using QuietWealth.Bakend.Shared.Infrastructure;
using QuietWealth.Backend.Domains.RetentionArchival.Repositories;
using QuietWealth.Backend.Domains.RetentionArchival.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var correlationId =
                context.HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
                ?? context.HttpContext.TraceIdentifier;

            var problemDetails = new ValidationProblemDetails(context.ModelState)
            {
                Type = "https://api.quietwealth/errors/validation",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Instance = context.HttpContext.Request.Path
            };

            problemDetails.Extensions["correlationId"] = correlationId;
            problemDetails.Extensions["errorCode"] = "validation.failed";
            problemDetails.Extensions["category"] = "validation";

            var result = new ObjectResult(problemDetails)
            {
                StatusCode = StatusCodes.Status400BadRequest
            };

            result.ContentTypes.Add("application/problem+json");
            return result;
        };
    });

builder.Services.Configure<AzureSqlOptions>(builder.Configuration.GetSection(AzureSqlOptions.SectionName));
builder.Services.Configure<BlobStorageOptions>(builder.Configuration.GetSection(BlobStorageOptions.SectionName));
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<NotificationHubOptions>(builder.Configuration.GetSection(NotificationHubOptions.SectionName));
builder.Services.Configure<RetentionPolicyOptions>(builder.Configuration.GetSection(RetentionPolicyOptions.SectionName));

builder.Services.AddSingleton<IAzureSqlConnectionFactory, AzureSqlConnectionFactory>();
builder.Services.AddSingleton<IAzureBlobClientFactory, AzureBlobClientFactory>();
builder.Services.AddSingleton<INotificationHubClientFactory, NotificationHubClientFactory>();
builder.Services.AddSingleton<IUnitOfWork, StubUnitOfWork>();
builder.Services.AddSingleton<IOutboxPublisher, StubOutboxPublisher>();

builder.Services.AddSingleton<IDocumentBatchRepository, DocumentBatchRepository>();
builder.Services.AddSingleton<IUserSessionRepository, UserSessionRepository>();
builder.Services.AddSingleton<IAuditEntryRepository, AuditEntryRepository>();
builder.Services.AddSingleton<IRetentionRecordRepository, RetentionRecordRepository>();

builder.Services.AddSingleton<IDocumentIntakeService, DocumentIntakeService>();
builder.Services.AddSingleton<IIdentityAccessService, IdentityAccessService>();
builder.Services.AddSingleton<IAuditObservabilityService, AuditObservabilityService>();
builder.Services.AddSingleton<IRetentionArchivalService, RetentionArchivalService>();

builder.Services
    .AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("Process is running."), tags: ["live"])
    .AddCheck(
        "azure-sql-config",
        () => RequireValues(
            ("AzureSql:ConnectionString", builder.Configuration["AzureSql:ConnectionString"])),
        tags: ["ready"])
    .AddCheck(
        "blob-storage-config",
        () => RequireValues(
            ("BlobStorage:ConnectionString", builder.Configuration["BlobStorage:ConnectionString"]),
            ("BlobStorage:DocumentsContainer", builder.Configuration["BlobStorage:DocumentsContainer"]),
            ("BlobStorage:TemplatesContainer", builder.Configuration["BlobStorage:TemplatesContainer"]),
            ("BlobStorage:ArtifactsContainer", builder.Configuration["BlobStorage:ArtifactsContainer"])),
        tags: ["ready"])
    .AddCheck(
        "redis-config",
        () => RequireValues(("Redis:ConnectionString", builder.Configuration["Redis:ConnectionString"])),
        tags: ["ready"])
    .AddCheck(
        "notification-hub-config",
        () => RequireValues(
            ("NotificationHub:ConnectionString", builder.Configuration["NotificationHub:ConnectionString"]),
            ("NotificationHub:HubName", builder.Configuration["NotificationHub:HubName"])),
        tags: ["ready"])
    .AddCheck(
        "retention-policy-config",
        () => RequireValues(("RetentionPolicy:ArchiveContainer", builder.Configuration["RetentionPolicy:ArchiveContainer"])),
        tags: ["ready"]);

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();
app.MapControllers();
app.MapHealthChecks("/health/live", CreateHealthCheckOptions("live"));
app.MapHealthChecks("/health/ready", CreateHealthCheckOptions("ready"));

app.Run();

static HealthCheckOptions CreateHealthCheckOptions(string tag)
{
    return new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains(tag),
        ResponseWriter = WriteHealthResponseAsync
    };
}

static HealthCheckResult RequireValues(params (string Key, string? Value)[] values)
{
    var missingKeys = values
        .Where(entry => string.IsNullOrWhiteSpace(entry.Value))
        .Select(entry => entry.Key)
        .ToArray();

    return missingKeys.Length == 0
        ? HealthCheckResult.Healthy()
        : HealthCheckResult.Unhealthy($"Missing configuration: {string.Join(", ", missingKeys)}");
}

static Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";

    var payload = new
    {
        status = report.Status.ToString(),
        totalDuration = report.TotalDuration,
        checks = report.Entries.Select(entry => new
        {
            name = entry.Key,
            status = entry.Value.Status.ToString(),
            duration = entry.Value.Duration,
            description = entry.Value.Description
        })
    };

    return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
}

public partial class Program;
