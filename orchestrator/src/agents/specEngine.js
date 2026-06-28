/**
 * Spec Engine – Specification Agent
 * Generates Spec Driven Development specs across all domains for a feature request.
 */

import { askClaude } from "../shared/claudeClient.js";
import { saveSpecFile, appendLog, DOMAINS } from "../shared/featureStore.js";

const SYSTEM_PROMPT = `You are the Specification Agent for QuietWealth, a financial trust platform.

QuietWealth's tech stack:
- Frontend: React 19 + TypeScript + Vite + TailwindCSS 4 + Redux Toolkit + Zod + Axios + Auth0
- Backend: ASP.NET Core 9 (C#) with domain-driven folder structure: controllers/models/services/repositories
- Database: Azure SQL (SQL Server 2022) with EF Core
- Cache: Redis
- Storage: Azure Blob Storage
- Testing: Jest + Playwright (frontend), xUnit (backend)
- CI/CD: GitHub Actions
- Observability: Azure Application Insights

Architecture pattern: Clean Architecture with domain modules under server/QuietWealth.Backend/domains/
Each domain has: controllers/, models/, services/, repositories/

Your role:
1. Read the feature request carefully
2. Generate a detailed Spec Driven Development specification for EACH of these 6 domains:
   - frontend: React components, hooks, state management, UI flows
   - backend: ASP.NET controller, service, repository, models
   - data: Database schema changes, EF migrations, SQL scripts
   - observability: Application Insights events, metrics, alerts
   - testing: Unit tests, integration tests, E2E tests
   - cicd: GitHub Actions changes, quality gates, deployment notes

Each spec must be actionable, concrete, and follow existing QuietWealth patterns.
Format each spec as clean Markdown with clear sections.`;

const DOMAIN_PROMPTS = {
  frontend: `Generate the FRONTEND specification covering:
- New React components needed (atoms/molecules/pages/hooks)
- State management changes (Redux slices or local state)
- API integration (Axios calls, endpoint contracts)
- Form validation with Zod schemas
- Auth guards and permission checks
- i18n keys to add (en/es)
- Unit tests (Jest) and E2E tests (Playwright)`,

  backend: `Generate the BACKEND specification covering:
- New domain folder name (under server/QuietWealth.Backend/domains/)
- Controller class: routes, HTTP methods, request/response models
- Service class: business logic, interface
- Repository class: data access, SQL queries, interface
- Domain events (IDomainEvent) if applicable
- Shared infrastructure used (BlobStorage, Notifications, JWT)
- Outbox messages if needed`,

  data: `Generate the DATA MODEL specification covering:
- New database tables with column definitions and types
- Foreign key relationships
- Indexes for performance
- EF Core entity classes
- Migration script (SQL)
- Seed data if needed
- Azure SQL specific considerations`,

  observability: `Generate the OBSERVABILITY specification covering:
- Azure Application Insights custom events to track
- Custom metrics and dimensions
- Distributed tracing spans
- Alert rules (threshold, severity)
- Health check additions
- CorrelationId propagation points
- Dashboard KPIs`,

  testing: `Generate the TESTING specification covering:
- Backend unit tests (xUnit): which classes to test, key scenarios
- Backend API tests: endpoint test cases
- Backend contract tests if external APIs are involved
- Frontend unit tests (Jest): components and hooks
- Frontend E2E tests (Playwright): user flow scenarios
- Test data fixtures and mocks
- Coverage targets`,

  cicd: `Generate the CI/CD specification covering:
- GitHub Actions workflow changes (ci-backend.yml or ci-frontend.yml)
- New quality gates or checks
- Environment variable changes
- Docker Compose changes if any
- Deployment notes for staging/production
- Feature flag considerations
- Rollback plan`,
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

Generate a detailed, actionable specification following QuietWealth's existing patterns.
Start with a summary, then provide specific implementation details.
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

    await appendLog(
      featureId,
      "SPEC-ENGINE",
      `Spec generation complete. ${Object.keys(specs).length}/${DOMAINS.length} domains succeeded.`
    );

    res.json({
      featureId,
      specs,
      errors,
      specPaths: Object.entries(specs).reduce((acc, [d, v]) => {
        acc[d] = v.filePath;
        return acc;
      }, {}),
    });
  });
}
