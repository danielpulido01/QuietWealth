namespace QuietWealth.Bakend.Shared.Api;

public sealed record ApiResponse<T>(T Data, string CorrelationId);
