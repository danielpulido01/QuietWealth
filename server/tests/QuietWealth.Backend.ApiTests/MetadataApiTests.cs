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

        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("name").GetString().Should().Be("DUA Backend OpenAPI Contract");
        payload.GetProperty("url").GetString().Should().Be("/openapi/dua-backend.openapi.json");
    }
}
