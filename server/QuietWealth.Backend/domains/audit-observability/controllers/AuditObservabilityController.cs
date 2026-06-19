using QuietWealth.Bakend.Domains.AuditObservability.Models;
using QuietWealth.Bakend.Domains.AuditObservability.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Domains.AuditObservability.Controllers;

[ApiController]
[Route("api/activity")]
public sealed class AuditObservabilityController(IAuditObservabilityService auditObservabilityService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<ActivityReadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<ActivityReadResponse>>> ReadAsync(CancellationToken cancellationToken)
    {
        var response = await auditObservabilityService.ReadActivityAsync(cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<ActivityReadResponse>(response, correlationId));
    }
}
