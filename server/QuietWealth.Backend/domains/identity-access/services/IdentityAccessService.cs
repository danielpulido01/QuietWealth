using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Services;

public sealed class IdentityAccessService(IUserSessionRepository userSessionRepository) : IIdentityAccessService
{
    public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
        => userSessionRepository.GetCurrentSessionAsync(cancellationToken);

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
