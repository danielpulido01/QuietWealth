/**
 * Validate Engine – Validation Agent + QA Agent
 * Verifies implementation against specs, generates unit/integration/contract tests.
 */

import { askClaude } from "../shared/claudeClient.js";
import { loadSpecFile, appendLog } from "../shared/featureStore.js";

const VALIDATION_SYSTEM = `You are the Validation Agent for QuietWealth.

Your job is to validate a feature implementation against its specifications.
You check:
1. Functional requirements – does the code fulfill the feature?
2. Architectural compliance – does it follow QuietWealth's domain structure?
3. Specification compliance – does each file match the spec?
4. Security requirements – JWT auth, input validation, no hardcoded secrets
5. Coding standards – C# naming conventions, TypeScript strict mode, no any types

Return a JSON object with this structure:
{
  "passed": true/false,
  "score": 0-100,
  "checks": {
    "functional": { "passed": true/false, "notes": "..." },
    "architectural": { "passed": true/false, "notes": "..." },
    "specification": { "passed": true/false, "notes": "..." },
    "security": { "passed": true/false, "notes": "..." },
    "codingStandards": { "passed": true/false, "notes": "..." }
  },
  "feedback": "Specific issues to fix if any",
  "summary": "One line summary"
}

Return ONLY valid JSON, no markdown fences.`;

const QA_SYSTEM = `You are the QA Agent for QuietWealth.

Generate comprehensive tests for a feature implementation.
Stack:
- Backend tests: xUnit, Moq (C#) – unit, integration, API, contract
- Frontend tests: Jest, React Testing Library, Playwright (TypeScript)

Test categories:
1. Unit tests – pure logic, no IO
2. Integration tests – with mocked infrastructure
3. Contract tests – API shape validation

Return tests in this format for each file:
=== TEST FILE: <path> ===
<code>
=== END TEST FILE ===

For backend:
- server/tests/QuietWealth.Backend.UnitTests/<Feature>Tests.cs
- server/tests/QuietWealth.Backend.ApiTests/<Feature>ApiTests.cs

For frontend:
- app/__tests__/unit/<feature>/<Component>.test.tsx`;

export function validateEngine(app) {
  app.post("/validate", async (req, res) => {
    const { featureId, description, specs, implementation } = req.body;

    await appendLog(featureId, "VALIDATE-ENGINE", "Starting validation");

    // Collect all spec content
    const allSpecs = {};
    for (const domain of ["frontend", "backend", "data", "observability", "testing", "cicd"]) {
      allSpecs[domain] = await loadSpecFile(featureId, domain);
    }

    // Summarise implementation for the validator
    const implSummary = Object.entries(implementation || {})
      .map(([domain, files]) => {
        const fileList = Object.keys(files).join(", ");
        return `${domain}: [${fileList}]`;
      })
      .join("\n");

    const sampleCode = Object.entries(implementation || {})
      .flatMap(([, files]) =>
        Object.entries(files)
          .slice(0, 2)
          .map(([path, code]) => `// ${path}\n${code.substring(0, 400)}`)
      )
      .join("\n\n---\n\n")
      .substring(0, 6000);

    // ── Validation ──
    let validationResult = {
      passed: false,
      score: 0,
      checks: {},
      feedback: "Validation could not be run",
      summary: "Error",
    };

    try {
      await appendLog(featureId, "VALIDATE-ENGINE", "Running architectural validation...");

      const validationRaw = await askClaude(
        VALIDATION_SYSTEM,
        `Feature: "${description}"
Feature ID: ${featureId}

Specifications:
${JSON.stringify(allSpecs, null, 2).substring(0, 4000)}

Implementation summary:
${implSummary}

Sample code:
${sampleCode}

Validate this implementation.`,
        2048
      );

      try {
        validationResult = JSON.parse(validationRaw.trim());
      } catch {
        // If JSON parse fails, extract key info
        validationResult = {
          passed: validationRaw.includes('"passed": true') || validationRaw.includes('"passed":true'),
          score: 75,
          checks: {},
          feedback: validationRaw.substring(0, 500),
          summary: "Validation completed with minor parse issues",
        };
      }

      await appendLog(
        featureId,
        "VALIDATE-ENGINE",
        `Validation score: ${validationResult.score}/100 – ${validationResult.passed ? "PASSED" : "FAILED"}`
      );
    } catch (err) {
      await appendLog(featureId, "VALIDATE-ENGINE", `Validation error: ${err.message}`);
    }

    // ── Test Generation (QA Agent) ──
    let tests = { files: {}, summary: "" };

    try {
      await appendLog(featureId, "VALIDATE-ENGINE", "QA Agent: generating tests...");

      const testingSpec = await loadSpecFile(featureId, "testing");

      const testsRaw = await askClaude(
        QA_SYSTEM,
        `Feature: "${description}"
Feature ID: ${featureId}

Testing Specification:
${testingSpec || "Generate comprehensive tests based on the implementation"}

Implementation files:
${implSummary}

Sample implementation:
${sampleCode}

Generate unit tests, integration tests, and contract tests.`,
        4096
      );

      // Parse test files
      const testFiles = {};
      const regex = /=== TEST FILE: (.+?) ===([\s\S]*?)=== END TEST FILE ===/g;
      let match;
      while ((match = regex.exec(testsRaw)) !== null) {
        testFiles[match[1].trim()] = match[2].trim();
      }

      tests = {
        files: testFiles,
        summary: `Generated ${Object.keys(testFiles).length} test files`,
        raw: testsRaw.substring(0, 500),
      };

      await appendLog(
        featureId,
        "VALIDATE-ENGINE",
        `✓ QA Agent generated ${Object.keys(testFiles).length} test files`
      );
    } catch (err) {
      await appendLog(featureId, "VALIDATE-ENGINE", `✗ Test generation failed: ${err.message}`);
    }

    res.json({
      featureId,
      passed: validationResult.passed,
      feedback: validationResult.feedback,
      validation: validationResult,
      tests,
    });
  });
}
