/**
 * Spec Engine – Specification Agent
 * Generates Spec Driven Development specs using REAL project code as reference.
 */

import { askClaude } from "../shared/claudeClient.js";
import { saveSpecFile, appendLog, DOMAINS } from "../shared/featureStore.js";

// ── Real code extracted from QuietWealth repo as architecture reference ──

const BACKEND_REFERENCE = `
// REAL PATTERN – Controller (identity-access domain)
using QuietWealth.Bakend.Domains.IdentityAccess.Models;
using QuietWealth.Bakend.Domains.IdentityAccess.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class IdentityAccessController(IIdentityAccessService identityAccessService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await identityAccessService.LoginAsync(request, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;
        return Ok(new ApiResponse<LoginResponse>(response, correlationId));
    }
}

// REAL PATTERN – Service
public sealed class IdentityAccessService(IUserSessionRepository userSessionRepository) : IIdentityAccessService
{
    public async Task<UserSession> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
    {
        var session = await userSessionRepository.GetCurrentSessionAsync(cancellationToken);
        if (session is null)
            throw new DomainNotFoundException("The current session was not found.", "identity.session_not_found");
        return session;
    }
}

// REAL PATTERN – Repository
public sealed class UserSessionRepository(IAzureSqlConnectionFactory azureSqlConnectionFactory) : IUserSessionRepository
{
    public Task<UserSession?> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _ = azureSqlConnectionFactory.GetConfiguredConnectionString();
            return Task.FromResult<UserSession?>(null);
        }
        catch (InfrastructureException) { throw; }
        catch (Exception ex)
        {
            throw new InfrastructureException(
                "Azure SQL is unavailable.",
                "infrastructure.azure_sql_unavailable",
                retryable: true,
                innerException: ex);
        }
    }
}

// REAL namespace pattern: QuietWealth.Bakend.Domains.<DomainName>.<Layer>
// REAL folder pattern: server/QuietWealth.Backend/domains/<domain-name>/<layer>/
`;

const FRONTEND_REFERENCE = `
// REAL PATTERN – Hook (useLogin.ts)
import { useState } from "react";
import { useSession } from "./useSession";
import { useApplicationServices } from "./useApplicationServices";

type LoginInput = { email: string; password: string; };

export function useLogin() {
  const { auth } = useApplicationServices();
  const { setSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(input: LoginInput) {
    setError(null);
    setIsLoading(true);
    try {
      const session = await auth.login(input);
      if (!session) { setError("No active session was returned."); return false; }
      setSession(session);
      return true;
    } catch (reason) {
      setError(auth.toErrorMessage(reason, "Login failed."));
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  return { login, isLoading, error };
}

// REAL PATTERN – Atom component (Input.tsx)
import { forwardRef, type InputHTMLAttributes } from "react";
function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
export type InputProps = InputHTMLAttributes<HTMLInputElement>;
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props }, ref,
) {
  return <input {...props} ref={ref} className={joinClasses("ui-input", className)} />;
});

// REAL folder structure:
// app/src/components/atoms/       → primitive components
// app/src/components/molecules/   → composite components  
// app/src/components/hooks/       → custom hooks (use<Name>.ts)
// app/src/components/pages/       → full page components
// Services accessed via: useApplicationServices() hook
`;

const SYSTEM_PROMPT = `You are the Specification Agent for QuietWealth, a financial trust platform.

QuietWealth's tech stack:
- Frontend: React 19 + TypeScript + Vite + TailwindCSS 4 + Redux Toolkit + Zod
- Backend: ASP.NET Core 9 (C#), namespace QuietWealth.Bakend (note: "Bakend" not "Backend")
- Database: Azure SQL (SQL Server 2022) with Dapper
- Cache: Redis
- Storage: Azure Blob Storage
- Testing: Jest + Playwright (frontend), xUnit (backend)
- CI/CD: GitHub Actions

REAL BACKEND CODE FROM THE PROJECT (follow these patterns exactly):
${BACKEND_REFERENCE}

REAL FRONTEND CODE FROM THE PROJECT (follow these patterns exactly):
${FRONTEND_REFERENCE}

RULES:
- Always use namespace QuietWealth.Bakend (not Backend) 
- Controllers use primary constructor injection (C# 12 style)
- Always return ApiResponse<T> from controllers with correlationId
- Always use CancellationToken in async methods
- Repositories use IAzureSqlConnectionFactory, throw InfrastructureException
- Hooks use useApplicationServices() to access services, never call fetch/axios directly
- Components use forwardRef pattern for inputs
- Domain folder: server/QuietWealth.Backend/domains/<domain-name>/

Generate specs that are actionable, concrete, and match these exact patterns.`;

const DOMAIN_PROMPTS = {
  frontend: `Generate the FRONTEND specification. Reference the real hook and component patterns shown above.
Cover: new hooks (following useLogin pattern), new components (atoms/molecules/pages),
state management, service calls via useApplicationServices(), Zod validation schemas, i18n keys.`,

  backend: `Generate the BACKEND specification. Reference the real Controller/Service/Repository patterns shown above.
Cover: new domain folder name, Controller class (primary constructor, ApiResponse<T>, correlationId, CancellationToken),
Service interface + implementation, Repository interface + implementation (IAzureSqlConnectionFactory),
request/response models, error handling (DomainNotFoundException, InfrastructureException).`,

  data: `Generate the DATA MODEL specification.
Cover: new SQL Server tables (snake_case names, UNIQUEIDENTIFIER PKs, GETUTCDATE() defaults),
indexes, foreign keys, Dapper query patterns for the repository, migration SQL script.`,

  observability: `Generate the OBSERVABILITY specification.
Cover: Azure Application Insights custom events with dimensions, metrics, alert rules,
CorrelationId propagation points, health check additions.`,

  testing: `Generate the TESTING specification.
Cover: xUnit tests for Service and Repository classes (mock IAzureSqlConnectionFactory),
Jest tests for hooks (mock useApplicationServices), Playwright E2E scenarios,
specific test method names following the pattern: MethodName_Condition_ExpectedResult.`,

  cicd: `Generate the CI/CD specification.
Cover: GitHub Actions changes (ci-backend.yml / ci-frontend.yml), quality gates,
new environment variables needed, dotnet build/test commands, feature flag considerations.`,
};

export function specEngine(app) {
  app.post("/generate-spec", async (req, res) => {
    const { featureId, description } = req.body;

    await appendLog(featureId, "SPEC-ENGINE", `Starting spec generation for: "${description}"`);

    const specs = {};
    const errors = [];

    for (const domain of DOMAINS) {
      try {
        await appendLog(featureId, "SPEC-ENGINE", `Generating ${domain} spec...`);

        const userMessage = `
Feature Request: "${description}"
Feature ID: ${featureId}

${DOMAIN_PROMPTS[domain]}

Generate a detailed, actionable specification that follows the EXACT patterns shown in the real code above.
Include specific class names, method signatures, and file paths matching the QuietWealth architecture.
`;

        const specContent = await askClaude(SYSTEM_PROMPT, userMessage, 3000);
        const filePath = await saveSpecFile(featureId, domain, specContent);
        specs[domain] = { filePath, preview: specContent.substring(0, 300) + "…" };

        await appendLog(featureId, "SPEC-ENGINE", `✓ ${domain} spec saved to ${filePath}`);
      } catch (err) {
        errors.push({ domain, error: err.message });
        await appendLog(featureId, "SPEC-ENGINE", `✗ ${domain} spec failed: ${err.message}`);
      }
    }

    res.json({ featureId, specs, errors,
      specPaths: Object.entries(specs).reduce((acc, [d, v]) => { acc[d] = v.filePath; return acc; }, {}),
    });
  });
}