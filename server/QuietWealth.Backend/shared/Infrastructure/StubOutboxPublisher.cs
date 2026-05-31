using QuietWealth.Bakend.Shared.Abstractions;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public sealed class StubOutboxPublisher : IOutboxPublisher
{
    public Task QueueAsync(OutboxMessage message, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
