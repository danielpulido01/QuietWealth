namespace QuietWealth.Bakend.Shared.Infrastructure;

public sealed record OutboxMessage(Guid MessageId, string EventName, string Payload, DateTimeOffset OccurredAtUtc);
