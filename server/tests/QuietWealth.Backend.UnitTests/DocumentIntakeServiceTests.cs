using FluentAssertions;
using Moq;
using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;
using QuietWealth.Bakend.Domains.DocumentIntake.Services;
using QuietWealth.Bakend.Shared.Errors;

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

    [Fact]
    public async Task UploadAsync_throws_domain_rule_violation_when_file_names_repeat()
    {
        var repository = new Mock<IDocumentBatchRepository>();
        var request = new UploadFilesRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            ["statement.pdf", "STATEMENT.PDF"]);

        var sut = new DocumentIntakeService(repository.Object);

        var act = async () => await sut.UploadAsync(request, CancellationToken.None);

        var exception = await act.Should().ThrowAsync<DomainRuleViolationException>();
        exception.Which.ErrorCode.Should().Be("document.duplicate_file_name");
    }
}
