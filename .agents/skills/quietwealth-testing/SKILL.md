---
name: quietwealth-testing
description: Guide QuietWealth test generation and execution. Use when creating or reviewing frontend Jest tests, backend xUnit tests, Playwright E2E coverage, OpenAPI-based contract tests, CI test workflows, coverage expectations, or PR evidence requirements.
---

# QuietWealth Testing

## Overview

Add the smallest meaningful automated proof for the change, then execute the narrowest relevant scope. Cover happy paths, error paths, and contract drift without claiming verification the repo cannot yet run.

## Workflow

1. Choose the right test layer:
   - Jest for frontend units and component-adjacent logic
   - xUnit for backend units and integration seams
   - Playwright for end-to-end user journeys
   - OpenAPI-driven contract tests for API compatibility
2. Add or update tests as close as possible to the changed behavior.
3. Cover both success and failure behavior, especially validation failures, auth failures, and async processing edge cases.
4. Run only the smallest meaningful test target that the repo supports today.
5. Capture evidence:
   - exact command
   - pass or fail result
   - blockers when execution is not possible
6. If the change modifies CI expectations, update GitHub Actions so test execution stays aligned with the real stack.

## Rules

- Use Jest for frontend slices, thunks, selectors, schema validators, hooks, and service helpers.
- Use xUnit for backend controllers, services, repositories, and mapping or validation behavior.
- Use Playwright for end-to-end flows such as auth, upload, status tracking, and user-visible error recovery.
- Add API contract checks from the OpenAPI surface whenever endpoint shape, status code behavior, or DTO contracts change.
- Include common error cases, not only the happy path.
- Prefer deterministic tests with mocked boundaries for HTTP, storage, auth, time, and randomness.
- Do not broaden to suite-wide execution unless the targeted run passes or broader coverage is explicitly requested.
- Do not approve a PR without test evidence or a precise explanation of why evidence could not be produced.
- Respect the team's minimum coverage threshold when it is defined in code or pipeline configuration.
- When manifests, projects, or toolchains are missing, report the exact blocker instead of implying success.

## Required Output

When this skill is used, document:

- `Hallazgos y Correcciones sugeridas`
- `Correcciones aplicadas`

Also include:

- test level selected
- exact verification command or blocker
- notable gaps in coverage
- PR evidence status

## Close-Out Checklist

- Confirm the chosen test level is the narrowest one that still proves the change.
- Confirm negative-path coverage exists for validation, auth, and async failure behavior where relevant.
- Confirm API changes have contract coverage or a documented reason they do not.
- Confirm CI will execute the added tests in GitHub Actions if the repo already supports that lane.
- Confirm the final report states exactly what was run and what remains unverified.
