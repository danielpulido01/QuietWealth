using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Controllers;

[ApiController]
[Route("api/files")]
public sealed class DocumentIntakeController(IDocumentIntakeService documentIntakeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<FilesReadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FilesReadResponse>>> ReadAsync(CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.ReadAsync(cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<FilesReadResponse>(response, correlationId));
    }

    [HttpPost("upload")]
    [ProducesResponseType(typeof(ApiResponse<UploadFilesResponse>), StatusCodes.Status202Accepted)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UploadFilesResponse>>> UploadAsync(
        [FromBody] UploadFilesRequest request,
        CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.UploadAsync(request, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Accepted(new ApiResponse<UploadFilesResponse>(response, correlationId));
    }

    [HttpDelete("{sourceDocumentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DeleteFileResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<DeleteFileResponse>>> DeleteAsync(
        Guid sourceDocumentId,
        CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.DeleteAsync(sourceDocumentId, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<DeleteFileResponse>(response, correlationId));
    }
}
