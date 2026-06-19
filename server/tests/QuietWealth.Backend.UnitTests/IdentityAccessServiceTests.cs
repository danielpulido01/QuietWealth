using FluentAssertions;
using Moq;
using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Repositories;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;

namespace QuietWealth.Backend.UnitTests;

public sealed class IdentityAccessServiceTests
{
    [Fact]
    public async Task GetCurrentSessionAsync_returns_repository_session()
    {
        var expected = new UserSession(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "jane.doe@quietwealth.test",
            ["Investor"],
            ["marketplace.read"],
            "jwt-token-placeholder",
            DateTimeOffset.UtcNow.AddMinutes(30));

        var repository = new Mock<IUserSessionRepository>();
        repository
            .Setup(x => x.GetCurrentSessionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var sut = new IdentityAccessService(repository.Object);

        var result = await sut.GetCurrentSessionAsync(CancellationToken.None);

        result.Should().Be(expected);
        repository.Verify(x => x.GetCurrentSessionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
