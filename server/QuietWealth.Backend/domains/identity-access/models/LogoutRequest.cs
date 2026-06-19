using QuietWealth.Bakend.Shared.Validation;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Models;

public sealed record LogoutRequest([NotEmptyGuid] Guid SessionId);
