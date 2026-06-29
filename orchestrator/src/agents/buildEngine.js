/**
 * Build Engine – Code Generation Orchestrator
 * Delegates to: Frontend Agent, Backend Agent, Data Agent, Infrastructure Agent
 */

import { askClaude } from "../shared/claudeClient.js";
import { loadSpecFile, appendLog } from "../shared/featureStore.js";

const BACKEND_SYSTEM = `You are the Backend Agent for QuietWealth.

REAL CODE PATTERNS TO FOLLOW EXACTLY:

// Namespace: QuietWealth.Bakend (not Backend)
// Controller pattern:
[ApiController]
[Route("api/<route>")]
public sealed class <Name>Controller(<IService> service) : ControllerBase
{
    [HttpPost("action")]
    [ProducesResponseType(typeof(ApiResponse<ResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<ResponseDto>>> ActionAsync(
        [FromBody] RequestDto request, CancellationToken cancellationToken)
    {
        var result = await service.ActionAsync(request, cancellationToken);
        var correlationId = HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;
        return Ok(new ApiResponse<ResponseDto>(result, correlationId));
    }
}

// Service pattern:
public sealed class <Name>Service(I<Name>Repository repository) : I<Name>Service
{
    public async Task<ResultDto> ActionAsync(RequestDto request, CancellationToken ct = default)
    {
        var result = await repository.GetAsync(request.Id, ct);
        if (result is null) throw new DomainNotFoundException("Not found.", "domain.not_found");
        return result;
    }
}

// Repository pattern:
public sealed class <Name>Repository(IAzureSqlConnectionFactory sqlFactory) : I<Name>Repository
{
    public async Task<Entity?> GetAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var conn = sqlFactory.GetConfiguredConnectionString();
            // Dapper query here
        }
        catch (InfrastructureException) { throw; }
        catch (Exception ex)
        {
            throw new InfrastructureException("Azure SQL unavailable.", "infrastructure.azure_sql_unavailable", true, ex);
        }
    }
}

Folder structure: server/QuietWealth.Backend/domains/<domain-name>/controllers/, services/, repositories/, models/
Generate production-ready C# code following these exact patterns.
Return files using:
=== FILE: server/QuietWealth.Backend/domains/<path> ===
<code>
=== END FILE ===`;

const FRONTEND_SYSTEM = `You are the Frontend Agent for QuietWealth.

REAL CODE PATTERNS TO FOLLOW EXACTLY:

// Hook pattern (follow useLogin exactly):
import { useState } from "react";
import { useApplicationServices } from "./useApplicationServices";

export function use<Name>() {
  const { <service> } = useApplicationServices();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(input: InputType) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await <service>.action(input);
      return result;
    } catch (reason) {
      setError("Action failed.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  return { action, isLoading, error };
}

// Component pattern (follow Input.tsx exactly):
import { forwardRef } from "react";
export const <Name> = forwardRef<HTMLElement, Props>(function <Name>({ className, ...props }, ref) {
  return <element {...props} ref={ref} className={joinClasses("ui-<name>", className)} />;
});

Folder structure:
- app/src/components/atoms/     → Input, Button, Badge etc
- app/src/components/molecules/ → composite components
- app/src/components/hooks/     → use<Name>.ts hooks
- app/src/components/pages/     → full page components

NEVER use axios/fetch directly — always use useApplicationServices().
Return files using:
=== FILE: app/src/<path> ===
<code>
=== END FILE ===`;

const DATA_SYSTEM = `You are the Data Agent for QuietWealth.
Generate SQL Server 2022 / Azure SQL DDL using Dapper conventions.
Rules:
- snake_case table and column names
- UNIQUEIDENTIFIER primary keys with DEFAULT NEWID()
- DATETIME2 for timestamps with DEFAULT GETUTCDATE()
- Named Dapper parameters (@ParamName) never string interpolation
- Always include indexes for foreign keys and WHERE clause columns
Return files using:
=== FILE: server/migrations/<path>.sql ===
<sql>
=== END FILE ===`;

const INFRA_SYSTEM = `You are the Infrastructure Agent for QuietWealth.
Generate Docker Compose additions, GitHub Actions workflow updates, and configuration changes.
Follow existing patterns in the project.`;

async function generateBackendCode(featureId, description, backendSpec, feedback) {
  const userMsg = `
Feature: "${description}"
Feature ID: ${featureId}

Backend Specification:
${backendSpec || "No spec available – infer from feature description"}

${feedback ? `Previous validation feedback to fix:\n${feedback}` : ""}

Generate the complete backend implementation files.
For each file, use this format:
=== FILE: server/QuietWealth.Backend/domains/<path> ===
<code>
=== END FILE ===
`;
  return askClaude(BACKEND_SYSTEM, userMsg, 4096);
}

async function generateFrontendCode(featureId, description, frontendSpec, feedback) {
  const userMsg = `
Feature: "${description}"
Feature ID: ${featureId}

Frontend Specification:
${frontendSpec || "No spec available – infer from feature description"}

${feedback ? `Previous validation feedback to fix:\n${feedback}` : ""}

Generate the complete frontend implementation files.
Use this format per file:
=== FILE: app/src/<path> ===
<code>
=== END FILE ===
`;
  const raw = await askClaude(FRONTEND_SYSTEM, userMsg, 4096);
  return raw;
}

async function generateDataCode(featureId, description, dataSpec) {
  const userMsg = `
Feature: "${description}"
Feature ID: ${featureId}

Data Specification:
${dataSpec || "No spec available"}

Generate SQL migration and EF Core entity files.
=== FILE: server/migrations/<featureId>.sql ===
<sql>
=== END FILE ===
`;
  return askClaude(DATA_SYSTEM, userMsg, 2048);
}

function parseFiles(rawOutput) {
  const files = {};
  
  // Try original format: === FILE: path ===
  const regex1 = /=== FILE: (.+?) ===([\s\S]*?)=== END FILE ===/g;
  let match;
  while ((match = regex1.exec(rawOutput)) !== null) {
    files[match[1].trim()] = match[2].trim();
  }
  if (Object.keys(files).length > 0) return files;

  // Fallback: ```language\n // filepath\n code ```
  const regex2 = /```[\w]*\n\/\/ (.+?)\n([\s\S]*?)```/g;
  while ((match = regex2.exec(rawOutput)) !== null) {
    files[match[1].trim()] = match[2].trim();
  }
  if (Object.keys(files).length > 0) return files;

  // Last resort: if Claude returned anything, store as single file
  const cleaned = rawOutput.replace(/```[\w]*/g, "").replace(/```/g, "").trim();
  if (cleaned.length > 100) {
    files["generated/implementation.md"] = cleaned;
  }

  return files;
}

export function buildEngine(app) {
  app.post("/build", async (req, res) => {
    const { featureId, description, specs, validationFeedback } = req.body;

    await appendLog(featureId, "BUILD-ENGINE", "Starting code generation");

    const implementation = {};

    // Load specs from the spec engine output
    const frontendSpec = await loadSpecFile(featureId, "frontend");
    const backendSpec = await loadSpecFile(featureId, "backend");
    const dataSpec = await loadSpecFile(featureId, "data");

    // Frontend Agent
    try {
      await appendLog(featureId, "BUILD-ENGINE", "Frontend Agent: generating code...");
      const raw = await generateFrontendCode(featureId, description, frontendSpec, validationFeedback);
      implementation.frontend = parseFiles(raw);
      await appendLog(featureId, "BUILD-ENGINE", `✓ Frontend: ${Object.keys(implementation.frontend).length} files`);
    } catch (err) {
      await appendLog(featureId, "BUILD-ENGINE", `✗ Frontend failed: ${err.message}`);
      implementation.frontend = {};
    }

    // Backend Agent
    try {
      await appendLog(featureId, "BUILD-ENGINE", "Backend Agent: generating code...");
      const raw = await generateBackendCode(featureId, description, backendSpec, validationFeedback);
      implementation.backend = parseFiles(raw);
      await appendLog(featureId, "BUILD-ENGINE", `✓ Backend: ${Object.keys(implementation.backend).length} files`);
    } catch (err) {
      await appendLog(featureId, "BUILD-ENGINE", `✗ Backend failed: ${err.message}`);
      implementation.backend = {};
    }

    // Data Agent
    try {
      await appendLog(featureId, "BUILD-ENGINE", "Data Agent: generating migrations...");
      const raw = await generateDataCode(featureId, description, dataSpec);
      implementation.data = parseFiles(raw);
      await appendLog(featureId, "BUILD-ENGINE", `✓ Data: ${Object.keys(implementation.data).length} files`);
    } catch (err) {
      await appendLog(featureId, "BUILD-ENGINE", `✗ Data Agent failed: ${err.message}`);
      implementation.data = {};
    }

    await appendLog(featureId, "BUILD-ENGINE", "Code generation complete");

    res.json({ featureId, implementation });
  });
}
