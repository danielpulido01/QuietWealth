using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class IdentityAccessController(IIdentityAccessService identityAccessService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await identityAccessService.LoginAsync(request, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<LoginResponse>(response, correlationId));
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> LogoutAsync(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        await identityAccessService.LogoutAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpGet("session")]
    [ProducesResponseType(typeof(ApiResponse<UserSession>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserSession>>> GetSessionAsync(CancellationToken cancellationToken)
    {
        var session = await identityAccessService.GetCurrentSessionAsync(cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<UserSession>(session, correlationId));
    }

    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserSession>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserSession>>> GetProfileAsync(CancellationToken cancellationToken)
    {
        var session = await identityAccessService.GetCurrentSessionAsync(cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<UserSession>(session, correlationId));
    }
}
