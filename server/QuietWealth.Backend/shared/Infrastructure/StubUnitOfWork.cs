using QuietWealth.Bakend.Shared.Abstractions;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public sealed class StubUnitOfWork : IUnitOfWork
{
    public Task CommitAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
