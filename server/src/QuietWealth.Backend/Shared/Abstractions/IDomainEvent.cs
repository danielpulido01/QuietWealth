namespace DUA.Backend.Shared.Abstractions;

public interface IDomainEvent
{
    DateTimeOffset OccurredAtUtc { get; }

    string EventName { get; }
}
