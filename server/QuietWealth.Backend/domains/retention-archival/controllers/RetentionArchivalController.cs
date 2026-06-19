using QuietWealth.Backend.Domains.RetentionArchival.Models;
using QuietWealth.Backend.Domains.RetentionArchival.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Backend.Domains.RetentionArchival.Controllers;

[ApiController]
[Route("api/retention")]
public sealed class RetentionArchivalController(IRetentionArchivalService retentionArchivalService) : ControllerBase
{
    [HttpPost("archive")]
    [ProducesResponseType(typeof(ApiResponse<ArchiveRecordsResponse>), StatusCodes.Status202Accepted)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<ArchiveRecordsResponse>>> ArchiveAsync(
        [FromBody] ArchiveRecordsRequest request,
        CancellationToken cancellationToken)
    {
        var response = await retentionArchivalService.ArchiveAsync(request, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Accepted(new ApiResponse<ArchiveRecordsResponse>(response, correlationId));
    }
}
