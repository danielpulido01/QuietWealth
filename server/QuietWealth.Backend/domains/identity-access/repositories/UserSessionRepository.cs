using QuietWealth.Bakend.Domains.IdentityAccess.Models;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

public sealed class UserSessionRepository : IUserSessionRepository
{
    public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
