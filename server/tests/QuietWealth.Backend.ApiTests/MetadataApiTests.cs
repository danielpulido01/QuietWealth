using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace QuietWealth.Backend.ApiTests;

public sealed class MetadataApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public MetadataApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task GetOpenApiLocation_returns_contract_url()
    {
        var response = await client.GetAsync("/api/metadata/openapi");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var correlationId = response.Headers.GetValues("X-Correlation-Id").Single();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("data").GetProperty("name").GetString().Should().Be("DUA Backend OpenAPI Contract");
        payload.GetProperty("data").GetProperty("url").GetString().Should().Be("/openapi/dua-backend.openapi.json");
        payload.GetProperty("correlationId").GetString().Should().Be(correlationId);
    }
}
