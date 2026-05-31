using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Services;

public sealed class IdentityAccessService(IUserSessionRepository userSessionRepository) : IIdentityAccessService
{
    public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
        => userSessionRepository.GetCurrentSessionAsync(cancellationToken);

    public Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
