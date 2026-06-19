using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

namespace QuietWealth.Backend.ApiTests;

public sealed class AuthSessionApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public AuthSessionApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IUserSessionRepository>();
                services.AddSingleton<IUserSessionRepository>(
                    new FakeUserSessionRepository(
                        new UserSession(
                            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                            Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                            "qa.user@quietwealth.test",
                            ["Expert"],
                            ["certification.review"],
                            "jwt-placeholder",
                            DateTimeOffset.UtcNow.AddMinutes(20))));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetSession_returns_current_user_session()
    {
        var response = await client.GetAsync("/api/auth/session");

        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("username").GetString().Should().Be("qa.user@quietwealth.test");
    }

    private sealed class FakeUserSessionRepository(UserSession session) : IUserSessionRepository
    {
        public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
            => Task.FromResult<UserSession?>(session);
    }
}
