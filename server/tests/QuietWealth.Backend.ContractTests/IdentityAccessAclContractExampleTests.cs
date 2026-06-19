using System.Text.Json;
using FluentAssertions;

namespace QuietWealth.Backend.ContractTests;

public sealed class IdentityAccessAclContractExampleTests
{
    [Fact]
    public void Auth0_claim_fixture_contains_required_boundary_fields()
    {
        var fixturePath = Path.Combine(AppContext.BaseDirectory, "Fixtures", "auth0-claims.sample.json");
        using var document = JsonDocument.Parse(File.ReadAllText(fixturePath));

        var root = document.RootElement;

        root.GetProperty("sub").GetString().Should().NotBeNullOrWhiteSpace();
        root.GetProperty("email").GetString().Should().Be("qa.user@quietwealth.test");
        root.GetProperty("roles").EnumerateArray().Select(x => x.GetString()).Should().Contain("Expert");
        root.GetProperty("permissions").EnumerateArray().Select(x => x.GetString()).Should().Contain("certification.review");
    }
}
