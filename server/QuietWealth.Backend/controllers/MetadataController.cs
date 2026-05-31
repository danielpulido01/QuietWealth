using Microsoft.AspNetCore.Mvc;

namespace QuietWealth.Bakend.Controllers;

[ApiController]
[Route("api/metadata")]
public sealed class MetadataController : ControllerBase
{
    [HttpGet("openapi")]
    public IActionResult GetOpenApiLocation()
    {
        return Ok(new
        {
            Name = "DUA Backend OpenAPI Contract",
            Url = "/openapi/dua-backend.openapi.json"
        });
    }
}
