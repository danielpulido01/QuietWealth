using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;
using QuietWealth.Bakend.Shared.Errors;

namespace QuietWealth.Backend.ApiTests;

public sealed class AuthSessionApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> factory;

    public AuthSessionApiTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task GetSession_returns_enveloped_session_and_correlation_id_header()
    {
        var session = new UserSession(
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            "qa.user@quietwealth.test",
            ["Expert"],
            ["certification.review"],
            "jwt-placeholder",
            DateTimeOffset.UtcNow.AddMinutes(20));

        using var client = CreateClient(new FakeIdentityAccessService(getCurrentSessionAsync: _ => Task.FromResult(session)));

        var response = await client.GetAsync("/api/auth/session");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var correlationId = response.Headers.GetValues("X-Correlation-Id").Single();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("data").GetProperty("username").GetString().Should().Be("qa.user@quietwealth.test");
        payload.GetProperty("correlationId").GetString().Should().Be(correlationId);
    }

    [Fact]
    public async Task GetSession_returns_problem_details_for_missing_session()
    {
        using var client = CreateClient(new FakeIdentityAccessService(
            getCurrentSessionAsync: _ => Task.FromException<UserSession>(
                new DomainNotFoundException("The current session was not found.", "identity.session_not_found"))));

        var response = await client.GetAsync("/api/auth/session");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        var correlationId = response.Headers.GetValues("X-Correlation-Id").Single();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("errorCode").GetString().Should().Be("identity.session_not_found");
        payload.GetProperty("correlationId").GetString().Should().Be(correlationId);
    }

    [Fact]
    public async Task GetSession_returns_problem_details_for_infrastructure_failure()
    {
        using var client = CreateClient(new FakeIdentityAccessService(
            getCurrentSessionAsync: _ => Task.FromException<UserSession>(
                new InfrastructureException(
                    "The request could not be completed because Azure SQL is unavailable.",
                    "infrastructure.azure_sql_unavailable",
                    retryable: true))));

        var response = await client.GetAsync("/api/auth/session");

        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        var correlationId = response.Headers.GetValues("X-Correlation-Id").Single();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        payload.GetProperty("errorCode").GetString().Should().Be("infrastructure.azure_sql_unavailable");
        payload.GetProperty("retryable").GetBoolean().Should().BeTrue();
        payload.GetProperty("correlationId").GetString().Should().Be(correlationId);
    }

    [Fact]
    public async Task Login_returns_validation_problem_details_when_request_is_invalid()
    {
        using var client = CreateClient(new FakeIdentityAccessService());

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "",
            password = "",
            otp = "12"
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

    private HttpClient CreateClient(IIdentityAccessService identityAccessService)
    {
        return factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting(WebHostDefaults.EnvironmentKey, Environments.Production);
            builder.ConfigureServices(services =>
            {
                services.AddLogging(logging => logging.ClearProviders());
                services.RemoveAll<IIdentityAccessService>();
                services.AddSingleton(identityAccessService);
            });
        }).CreateClient();
    }

    private sealed class FakeIdentityAccessService(
        Func<CancellationToken, Task<UserSession>>? getCurrentSessionAsync = null) : IIdentityAccessService
    {
        public Task<UserSession> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
        {
            if (getCurrentSessionAsync is not null)
            {
                return getCurrentSessionAsync(cancellationToken);
            }

            var session = new UserSession(
                Guid.NewGuid(),
                Guid.NewGuid(),
                "default.user@quietwealth.test",
                ["User"],
                ["platform.access"],
                "jwt-token-placeholder",
                DateTimeOffset.UtcNow.AddMinutes(30));

            return Task.FromResult(session);
        }

        public Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var session = new UserSession(
                Guid.NewGuid(),
                Guid.NewGuid(),
                request.Username,
                ["User"],
                ["platform.access"],
                "jwt-token-placeholder",
                DateTimeOffset.UtcNow.AddMinutes(30));

            return Task.FromResult(new LoginResponse(session));
        }

        public Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }
}
