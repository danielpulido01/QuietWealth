using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
    .AllowAnyHeader()
    .AllowAnyMethod()));
builder.Services.AddSingleton<LocalMvpStore>();

var app = builder.Build();
app.UseExceptionHandler();
app.UseCors();
app.MapControllers();
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false, ResponseWriter = WriteHealthResponseAsync });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = _ => false, ResponseWriter = WriteHealthResponseAsync });
app.Run();

static Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";
    return context.Response.WriteAsync(JsonSerializer.Serialize(new { status = "Healthy", mode = "local-mvp" }));
}

public sealed class LocalMvpStore
{
    public List<SmeProfile> Smes { get; } = Seed.Smes();
    public List<ValidationRequest> Requests { get; } = Seed.Requests();
    public List<LocalDocument> Documents { get; } = [];
}
public sealed record LocalDocument(Guid Id, Guid SmeId, string FileName, long Size, string ContentType, DateTimeOffset UploadedAt, string? DataUrl);
public sealed record SmeProfile(Guid Id, string Name, string Sector, string CertificationStatus, int TrustLevel, decimal GrowthRate, decimal TotalRaised, int ActiveInvestors, decimal AverageRoi, decimal RetentionRate, decimal Mrr, decimal ProfitMargin, string Description, IReadOnlyList<decimal> FinancialSeries);
public sealed record ValidationRequest(Guid Id, Guid SmeId, string Company, string Sector, DateTimeOffset SubmittedAt, string Status, IReadOnlyList<string> Documents, string? Reason);
public sealed record DecisionRequest(string? Reason);
public sealed record UploadDocumentRequest(Guid SmeId, string FileName, long Size, string ContentType, string? DataUrl);

static class Seed
{
 public static List<SmeProfile> Smes() => [
  new(Guid.Parse("00000000-0000-0000-0000-000000000001"),"NubeVerde","Technology","Certified",92,28,1250000,48,18,94,84000,21,"Software de eficiencia energética para edificios.",[72,76,81,87,94,101]),
  new(Guid.Parse("00000000-0000-0000-0000-000000000002"),"Solaris CR","Energy","Certified",88,24,980000,36,16,91,69000,19,"Instalación y monitoreo solar para comercios.",[56,61,67,73,79,86]),
  new(Guid.Parse("00000000-0000-0000-0000-000000000003"),"Mercado Local","Commerce","Certified",85,19,760000,31,14,89,51000,17,"Red de abastecimiento para comercios independientes.",[42,47,52,58,65,71]),
  new(Guid.Parse("00000000-0000-0000-0000-000000000004"),"AgroPulse","Technology","UnderReview",67,31,420000,17,20,87,37000,13,"Analítica de cultivos y finanzas agrícolas.",[25,29,34,40,46,54]),
  new(Guid.Parse("00000000-0000-0000-0000-000000000005"),"Ruta Clara","Commerce","Rejected",40,8,180000,8,5,72,22000,6,"Logística urbana de última milla.",[17,18,20,22,23,25])];
 public static List<ValidationRequest> Requests() => [
  new(Guid.Parse("10000000-0000-0000-0000-000000000001"),Guid.Parse("00000000-0000-0000-0000-000000000004"),"AgroPulse","Technology",DateTimeOffset.UtcNow.AddDays(-2),"UnderReview",["estado-resultados.pdf","balance-general.xlsx"],null),
  new(Guid.Parse("10000000-0000-0000-0000-000000000002"),Guid.Parse("00000000-0000-0000-0000-000000000005"),"Ruta Clara","Commerce",DateTimeOffset.UtcNow.AddDays(-1),"UnderReview",["flujo-caja.pdf"],null),
  new(Guid.Parse("10000000-0000-0000-0000-000000000003"),Guid.Parse("00000000-0000-0000-0000-000000000001"),"NubeVerde","Technology",DateTimeOffset.UtcNow.AddDays(-20),"Certified",["auditoria-2025.pdf"],"Certificación emitida"),
  new(Guid.Parse("10000000-0000-0000-0000-000000000004"),Guid.Parse("00000000-0000-0000-0000-000000000005"),"Ruta Clara","Commerce",DateTimeOffset.UtcNow.AddDays(-30),"Rejected",["resultados.pdf"],"Falta evidencia de ingresos recurrentes")];
}

[ApiController, Route("api/local-auth")]
public sealed class LocalAuthController : ControllerBase
{
 [HttpPost("login")] public ActionResult Login([FromBody] LocalLoginRequest request) { var role = request.Role is "Investor" or "SME" or "Expert" ? request.Role : "Investor"; return Ok(new { email = request.Email, role, sessionId = Guid.NewGuid(), isLocalDemo = true }); }
 [HttpPost("logout")] public IActionResult Logout() => NoContent();
 [HttpGet("session")] public IActionResult Session() => Ok(new { isLocalDemo = true });
}
public sealed record LocalLoginRequest(string Email, string Role);

[ApiController, Route("api/marketplace")]
public sealed class MarketplaceController(LocalMvpStore store) : ControllerBase
{
 [HttpGet] public ActionResult Get(string? search, string? sector, string? trustLevel, string? certificationStatus) { var r=store.Smes.AsEnumerable(); if(!string.IsNullOrWhiteSpace(search))r=r.Where(x=>x.Name.Contains(search,StringComparison.OrdinalIgnoreCase)); if(!string.IsNullOrWhiteSpace(sector))r=r.Where(x=>x.Sector.Equals(sector,StringComparison.OrdinalIgnoreCase)); if(!string.IsNullOrWhiteSpace(certificationStatus))r=r.Where(x=>x.CertificationStatus.Equals(certificationStatus,StringComparison.OrdinalIgnoreCase)); if(int.TryParse(trustLevel,out var trust))r=r.Where(x=>x.TrustLevel>=trust); return Ok(r); }
 [HttpGet("{id:guid}")] public ActionResult Get(Guid id) => store.Smes.FirstOrDefault(x=>x.Id==id) is { } sme ? Ok(sme) : NotFound();
}

[ApiController, Route("api/local-files")]
public sealed class LocalDocumentsController(LocalMvpStore store) : ControllerBase
{
 static readonly string[] Allowed=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","image/png","image/jpeg"];
 [HttpGet] public ActionResult Get()=>Ok(store.Documents);
 [HttpGet("open")] public IActionResult Open(string fileName) { var doc=store.Documents.LastOrDefault(x=>x.FileName.Equals(fileName,StringComparison.OrdinalIgnoreCase)); if(doc?.DataUrl is not null && doc.DataUrl.Contains(",")) { var bytes=Convert.FromBase64String(doc.DataUrl.Split(",",2)[1]); return File(bytes,doc.ContentType,doc.FileName); } return Content($"<html><body style='font-family:Arial;padding:40px'><h1>{System.Net.WebUtility.HtmlEncode(fileName)}</h1><p>Documento de datos demo. Este archivo seed no tiene contenido físico asociado.</p></body></html>","text/html"); }
 [HttpPost("upload")] public ActionResult Upload([FromBody] UploadDocumentRequest request) { if(!Allowed.Contains(request.ContentType)||request.Size>10*1024*1024) return BadRequest(new { message="Formato no permitido o archivo mayor a 10 MB."}); var doc=new LocalDocument(Guid.NewGuid(),request.SmeId,request.FileName,request.Size,request.ContentType,DateTimeOffset.UtcNow,request.DataUrl);store.Documents.Add(doc);var sme=store.Smes.FirstOrDefault(x=>x.Id==request.SmeId);if(sme is not null){var req=new ValidationRequest(Guid.NewGuid(),sme.Id,sme.Name,sme.Sector,DateTimeOffset.UtcNow,"UnderReview",[doc.FileName],null);store.Requests.Add(req);var i=store.Smes.IndexOf(sme);store.Smes[i]=sme with {CertificationStatus="UnderReview"};}return Accepted(new { document=doc, status="Uploaded"}); }
}

[ApiController, Route("api/validation/requests")]
public sealed class ValidationController(LocalMvpStore store) : ControllerBase
{
 [HttpGet] public ActionResult Get()=>Ok(store.Requests);
 [HttpGet("{id:guid}")] public ActionResult Get(Guid id)=>store.Requests.FirstOrDefault(x=>x.Id==id) is {} r?Ok(r):NotFound();
 [HttpPost("{id:guid}/approve")] public ActionResult Approve(Guid id)=>Decide(id,true,null);
 [HttpPost("{id:guid}/reject")] public ActionResult Reject(Guid id,[FromBody] DecisionRequest decision)=>Decide(id,false,decision.Reason);
 ActionResult Decide(Guid id,bool approved,string? reason){var i=store.Requests.FindIndex(x=>x.Id==id);if(i<0)return NotFound();var r=store.Requests[i] with {Status=approved?"Certified":"Rejected",Reason=reason??(approved?"Certificación emitida por experto":"Documentación incompleta")};store.Requests[i]=r;var j=store.Smes.FindIndex(x=>x.Id==r.SmeId);if(j>=0)store.Smes[j]=store.Smes[j] with {CertificationStatus=r.Status,TrustLevel=approved?86:40};return Ok(r);}
}


