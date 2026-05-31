using QuietWealth.Bakend.Domains.IdentityAccess.Models;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Repositories;

public interface IUserSessionRepository
{
    Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default);
}
