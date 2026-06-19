using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;

namespace QuietWealth.Backend.ApiTests;

public sealed class DocumentIntakeApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public DocumentIntakeApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting(WebHostDefaults.EnvironmentKey, Environments.Production);
            builder.ConfigureServices(services =>
            {
                services.AddLogging(logging => logging.ClearProviders());
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Upload_returns_validation_problem_details_when_request_shape_is_invalid()
    {
        var response = await client.PostAsJsonAsync("/api/files/upload", new
        {
            generationSessionId = Guid.Empty,
            ownerUserId = Guid.Empty,
            fileNames = Array.Empty<string>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        var correlationId = response.Headers.GetValues("X-Correlation-Id").Single();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("errorCode").GetString().Should().Be("validation.failed");
        payload.GetProperty("correlationId").GetString().Should().Be(correlationId);
        payload.TryGetProperty("errors", out var errors).Should().BeTrue();
        errors.EnumerateObject().Should().NotBeEmpty();
    }
}
