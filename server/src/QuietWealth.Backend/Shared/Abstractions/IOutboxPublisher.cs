using QuietWealth.Bakend.Shared.Infrastructure;

namespace QuietWealth.Bakend.Shared.Abstractions;

public interface IOutboxPublisher
{
    Task QueueAsync(OutboxMessage message, CancellationToken cancellationToken = default);
}
