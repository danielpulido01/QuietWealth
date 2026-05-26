namespace QuietWealth.Bakend.Domains.IdentityAccess.Models;

public sealed record LoginRequest(string Username, string Password, string Otp);
