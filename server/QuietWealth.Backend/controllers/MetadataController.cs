using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Controllers;

[ApiController]
[Route("api/metadata")]
public sealed class MetadataController : ControllerBase
{
    [ProducesResponseType(typeof(ApiResponse<OpenApiLocationResponse>), StatusCodes.Status200OK)]
    [HttpGet("openapi")]
    public ActionResult<ApiResponse<OpenApiLocationResponse>> GetOpenApiLocation()
    {
        var response = new OpenApiLocationResponse(
            "DUA Backend OpenAPI Contract",
            "/openapi/dua-backend.openapi.json");

        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<OpenApiLocationResponse>(response, correlationId));
    }
}
