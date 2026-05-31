using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;
using Microsoft.AspNetCore.Mvc;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class IdentityAccessController(IIdentityAccessService identityAccessService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await identityAccessService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        await identityAccessService.LogoutAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpGet("session")]
    public async Task<ActionResult<UserSession?>> GetSessionAsync(CancellationToken cancellationToken)
    {
        var session = await identityAccessService.GetCurrentSessionAsync(cancellationToken);
        return Ok(session);
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserSession?>> GetProfileAsync(CancellationToken cancellationToken)
    {
        var session = await identityAccessService.GetCurrentSessionAsync(cancellationToken);
        return Ok(session);
    }
}
