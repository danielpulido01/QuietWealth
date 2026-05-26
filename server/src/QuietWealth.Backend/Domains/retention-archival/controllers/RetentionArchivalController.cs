using DUA.Backend.Domains.RetentionArchival.Models;
using DUA.Backend.Domains.RetentionArchival.Services;
using Microsoft.AspNetCore.Mvc;

namespace DUA.Backend.Domains.RetentionArchival.Controllers;

[ApiController]
[Route("api/retention")]
public sealed class RetentionArchivalController(IRetentionArchivalService retentionArchivalService) : ControllerBase
{
    [HttpPost("archive")]
    public async Task<ActionResult<ArchiveRecordsResponse>> ArchiveAsync(
        [FromBody] ArchiveRecordsRequest request,
        CancellationToken cancellationToken)
    {
        var response = await retentionArchivalService.ArchiveAsync(request, cancellationToken);
        return Accepted(response);
    }
}
