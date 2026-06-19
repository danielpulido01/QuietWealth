using FluentAssertions;
using Moq;
using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;
using QuietWealth.Bakend.Domains.DocumentIntake.Services;

namespace QuietWealth.Backend.UnitTests;

public sealed class DocumentIntakeServiceTests
{
    [Fact]
    public async Task ReadAsync_returns_batches_from_repository()
    {
        var expectedBatch = new DocumentBatch(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Array.Empty<SourceDocument>(),
            "Pending",
            DateTimeOffset.UtcNow);

        var repository = new Mock<IDocumentBatchRepository>();
        repository
            .Setup(x => x.ListAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([expectedBatch]);

        var sut = new DocumentIntakeService(repository.Object);

        var response = await sut.ReadAsync(CancellationToken.None);

        response.DocumentBatches.Should().ContainSingle();
        response.DocumentBatches.Single().Should().Be(expectedBatch);
        repository.Verify(x => x.ListAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
