namespace QuietWealth.Bakend.Domains.IdentityAccess.Models;

public sealed record AccessPolicy(string PolicyName, IReadOnlyCollection<string> RequiredPermissions);
