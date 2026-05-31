namespace QuietWealth.Bakend.Shared.Api;

public sealed record ErrorResponse(string Code, string Message, string CorrelationId);
