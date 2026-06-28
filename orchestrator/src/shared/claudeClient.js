import Anthropic from "@anthropic-ai/sdk";
import { MOCK_SPECS, MOCK_IMPLEMENTATION, MOCK_VALIDATION, MOCK_TESTS } from "./mockResponses.js";

const IS_MOCK = process.env.AI_MOCK === "true";
const client = IS_MOCK ? null : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (IS_MOCK) {
  console.log("AI_MOCK=true — using mock responses (no API calls)");
}

export async function askClaude(systemPrompt, userMessage, maxTokens = 4096) {
  if (IS_MOCK) return getMockResponse(userMessage);
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

function getMockResponse(userMessage) {
  const msg = userMessage.toLowerCase();

  // Spec generation
  if (msg.includes("frontend specification") || msg.includes("react components")) {
    return `=== FILE: mock/frontend-spec.md ===\n${MOCK_SPECS.frontend}\n=== END FILE ===`;
  }
  if (msg.includes("backend specification") || msg.includes("aspnetcore")) {
    return `=== FILE: mock/backend-spec.md ===\n${MOCK_SPECS.backend}\n=== END FILE ===`;
  }
  if (msg.includes("data model") || msg.includes("sql server")) {
    return `=== FILE: mock/data-spec.md ===\n${MOCK_SPECS.data}\n=== END FILE ===`;
  }
  if (msg.includes("observability") || msg.includes("application insights")) {
    return `=== FILE: mock/observability-spec.md ===\n${MOCK_SPECS.observability}\n=== END FILE ===`;
  }
  if (msg.includes("testing specification") || msg.includes("xunit")) {
    return `=== FILE: mock/testing-spec.md ===\n${MOCK_SPECS.testing}\n=== END FILE ===`;
  }
  if (msg.includes("ci/cd") || msg.includes("github actions")) {
    return `=== FILE: mock/cicd-spec.md ===\n${MOCK_SPECS.cicd}\n=== END FILE ===`;
  }

  // Build - frontend
  if (msg.includes("frontend implementation") || msg.includes("react 19")) {
    return Object.entries(MOCK_IMPLEMENTATION.frontend)
      .map(([path, code]) => `=== FILE: ${path} ===\n${code}\n=== END FILE ===`)
      .join("\n\n");
  }

  // Build - backend
  if (msg.includes("backend implementation") || msg.includes("asp.net")) {
    return Object.entries(MOCK_IMPLEMENTATION.backend)
      .map(([path, code]) => `=== FILE: ${path} ===\n${code}\n=== END FILE ===`)
      .join("\n\n");
  }

  // Build - data
  if (msg.includes("sql migration") || msg.includes("ef core")) {
    return Object.entries(MOCK_IMPLEMENTATION.data)
      .map(([path, code]) => `=== FILE: ${path} ===\n${code}\n=== END FILE ===`)
      .join("\n\n");
  }

  // Validation
  if (msg.includes("validate") || msg.includes("validation")) {
    return JSON.stringify(MOCK_VALIDATION);
  }

  // Tests
  if (msg.includes("unit tests") || msg.includes("xunit") || msg.includes("jest")) {
    return Object.entries(MOCK_TESTS.files)
      .map(([path, code]) => `=== TEST FILE: ${path} ===\n${code}\n=== END TEST FILE ===`)
      .join("\n\n");
  }

  // Release notes
  if (msg.includes("release notes") || msg.includes("pull request")) {
    return `## Password Reset Feature\n\nImplements customer self-service password reset flow.\n\n### Changes\n- Frontend: PasswordResetRequestPage, usePasswordReset hook\n- Backend: PasswordResetController, PasswordResetService\n- Data: password_reset_tokens table migration`;
  }

  // Default fallback
  return `=== FILE: mock/response.md ===\nMock response for: ${userMessage.substring(0, 100)}\n=== END FILE ===`;
}