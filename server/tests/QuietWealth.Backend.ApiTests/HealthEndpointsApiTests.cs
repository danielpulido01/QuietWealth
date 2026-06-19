using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace QuietWealth.Backend.ApiTests;

public sealed class HealthEndpointsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public HealthEndpointsApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Liveness_endpoint_returns_ok_when_process_is_running()
    {
        var response = await client.GetAsync("/health/live");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("status").GetString().Should().Be("Healthy");
        payload.GetProperty("mode").GetString().Should().Be("local-mvp");
        payload.GetProperty("checks").EnumerateArray().Should().ContainSingle();
    }

    [Fact]
    public async Task Readiness_endpoint_returns_ok_when_required_configuration_exists()
    {
        var response = await client.GetAsync("/health/ready");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("status").GetString().Should().Be("Healthy");
        payload.GetProperty("mode").GetString().Should().Be("local-mvp");
        payload.GetProperty("checks")
            .EnumerateArray()
            .Select(check => check.GetProperty("name").GetString())
            .Should()
            .Contain(["azure-sql-config", "blob-storage-config", "redis-config"]);
    }
}
