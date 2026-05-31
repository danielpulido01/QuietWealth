namespace QuietWealth.Bakend.Domains.IdentityAccess.Models;

public sealed record UserSession(
    Guid SessionId,
    Guid UserId,
    string Username,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    string JwtToken,
    DateTimeOffset ExpiresAtUtc);
