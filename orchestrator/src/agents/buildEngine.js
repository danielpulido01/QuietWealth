/**
 * Build Engine – Code Generation Orchestrator
 * Delegates to: Frontend Agent, Backend Agent, Data Agent, Infrastructure Agent
 */

import { askClaude } from "../shared/claudeClient.js";
import { loadSpecFile, appendLog } from "../shared/featureStore.js";

const BACKEND_SYSTEM = `You are the Backend Agent for QuietWealth, an ASP.NET Core 9 (C#) API.

Architecture: Domain-driven, Clean Architecture.
- Each domain under: server/QuietWealth.Backend/domains/<domain-name>/
  - controllers/<Name>Controller.cs
  - models/<Request>.cs, <Response>.cs, <Entity>.cs
  - services/I<Name>Service.cs, <Name>Service.cs
  - repositories/I<Name>Repository.cs, <Name>Repository.cs

Follow existing patterns:
- Controllers inherit from ControllerBase, use [ApiController], [Route("api/[controller]")]
- Services receive repositories via DI, return typed results
- Repositories use AzureSqlConnectionFactory for Dapper queries
- Use ApiResponse<T> wrapper for all responses
- Domain events implement IDomainEvent
- Use AppException for business errors

Generate production-ready C# code following these conventions.
Return ONLY file paths and code, no explanations.`;

const FRONTEND_SYSTEM = `You are the Frontend Agent for QuietWealth, a React 19 + TypeScript SPA.

Structure: src/components/{atoms,molecules,pages,hooks}, src/auth/, src/state/
- Atoms: primitive components (Button, Input, Select, StatusBadge, Surface)
- Molecules: composite components 
- Pages: full page components
- Hooks: custom React hooks in src/components/hooks/
- State: Redux Toolkit slices in src/state/

Stack: React 19, TypeScript, TailwindCSS 4, Redux Toolkit, Zod, Axios, i18next
Auth: AuthGuard/GuestGuard/PolicyGuard with role-based permissions
API: Use applicationFacade (facade pattern over Axios)

Generate production-ready TypeScript/TSX following existing patterns.
Return file paths and code only.`;

const DATA_SYSTEM = `You are the Data Agent for QuietWealth.
Generate SQL Server 2022 / Azure SQL DDL and EF Core entity classes.
Follow conventions: snake_case table names, PascalCase C# classes, UUID primary keys.
Include proper indexes and foreign keys.`;

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
  console.log("=== FRONTEND RAW OUTPUT ===");
  console.log(raw.substring(0, 1000));
  console.log("=== END RAW ===");
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
