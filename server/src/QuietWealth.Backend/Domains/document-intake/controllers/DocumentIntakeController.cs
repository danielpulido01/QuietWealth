using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Services;
using Microsoft.AspNetCore.Mvc;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Controllers;

[ApiController]
[Route("api/files")]
public sealed class DocumentIntakeController(IDocumentIntakeService documentIntakeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<FilesReadResponse>> ReadAsync(CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.ReadAsync(cancellationToken);
        return Ok(response);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<UploadFilesResponse>> UploadAsync(
        [FromBody] UploadFilesRequest request,
        CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.UploadAsync(request, cancellationToken);
        return Accepted(response);
    }

    [HttpDelete("{sourceDocumentId:guid}")]
    public async Task<ActionResult<DeleteFileResponse>> DeleteAsync(Guid sourceDocumentId, CancellationToken cancellationToken)
    {
        var response = await documentIntakeService.DeleteAsync(sourceDocumentId, cancellationToken);
        return Ok(response);
    }
}
