using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;
using QuietWealth.Bakend.Shared.Errors;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Services;

public sealed class IdentityAccessService(IUserSessionRepository userSessionRepository) : IIdentityAccessService
{
    public async Task<UserSession> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
    {
        var session = await userSessionRepository.GetCurrentSessionAsync(cancellationToken);

        if (session is null)
        {
            throw new DomainNotFoundException(
                "The current session was not found.",
                "identity.session_not_found");
        }

        return session;
    }

    public Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var session = new UserSession(
            Guid.NewGuid(),
            Guid.NewGuid(),
            request.Username,
            ["User"],
            ["platform.access"],
            "placeholder-jwt-token",
            DateTimeOffset.UtcNow.AddHours(1));

        return Task.FromResult(new LoginResponse(session));
    }

    public Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
