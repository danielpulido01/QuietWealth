# Frontend Testing Examples

This guide documents the testing patterns already used in `app/__tests__` and gives concrete starter examples for the required Playwright flows.

## Commands

Run from `app/`:

```bash
npm run test
npm run test:ci
npm run test:e2e
```

- `npm run test` runs the Jest unit suite without coverage.
- `npm run test:ci` runs the Jest unit suite with the CI coverage gate from `jest.config.ts`.
- `npm run test:e2e` runs the Playwright flows from `__tests__/e2e`.

## Current Unit Test Layout

| Folder | Real examples in this repo |
|---|---|
| `__tests__/unit/auth/` | `AuthProvider.test.tsx`, `authService.test.ts`, `guards.test.tsx`, `permission-helpers.test.ts` |
| `__tests__/unit/services/` | `client.test.ts`, `httpInterceptors.test.ts`, `applicationFacade.test.ts`, `unauthorizedHandlingStrategy.test.ts` |
| `__tests__/unit/validation/` | `auth-schemas.test.ts`, `schema-validator.test.ts` |
| `__tests__/unit/polling/` | `PollingOrchestrator.test.ts` currently contains a skipped placeholder |

`jest.config.ts` currently enforces 80% statement coverage for:

- `src/auth/**/*.{ts,tsx}`
- `src/services/**/*.{ts,tsx}`
- `src/data-validation/**/*.{ts,tsx}`

`polling` is documented in the README, but it is not part of the active coverage gate yet.

## Unit Test Example: Guard Component

Use this pattern when the component depends on router state and custom hooks.

Real file:
- `__tests__/unit/auth/guards.test.tsx`

What it does:
- mocks `useSession` and `usePermissions`
- imports the guard after the mocks are registered
- renders inside `MemoryRouter`
- asserts either protected content or the redirect target

Example:

```tsx
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const useSessionMock = jest.fn();

jest.unstable_mockModule("../../../src/components/hooks/useSession", () => ({
  useSession: useSessionMock,
}));

const { AuthGuard } = await import("../../../src/auth/guards/AuthGuard");

it("redirects unauthenticated users to login", () => {
  useSessionMock.mockReturnValue({ isAuthenticated: false });

  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={(
            <AuthGuard>
              <div>Protected content</div>
            </AuthGuard>
          )}
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText("Login page")).toBeInTheDocument();
});
```

Use this for:
- guards
- providers that depend on hooks
- route-aware UI

## Unit Test Example: Auth Service

Use this pattern when testing service logic with mocked HTTP boundaries.

Real file:
- `__tests__/unit/auth/authService.test.ts`

What it does:
- spies on `httpClientFacade.fetch` and `httpClientFacade.authFetch`
- verifies request payload normalization
- verifies session updates and error handling

Example:

```ts
import { jest } from "@jest/globals";
import { authService } from "../../../src/auth/authService";
import { httpClientFacade } from "../../../src/services/client";
import { sessionManager } from "../../../src/state/sessionManager";

it("logs in with a validated payload and returns the normalized session", async () => {
  const normalizedSession = {
    user: {
      id: "user-1",
      email: "user@example.com",
      isGlobalAdmin: false,
      tenantIds: [],
      tenantRoles: [],
    },
    roles: [],
    permissions: [],
    isAuthenticated: true,
  };

  jest.spyOn(httpClientFacade, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
  jest.spyOn(httpClientFacade, "authFetch").mockResolvedValue(
    new Response(JSON.stringify({
      userId: "user-1",
      email: "user@example.com",
      isAuthenticated: true,
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  const setSessionSpy = jest.spyOn(sessionManager, "setSession").mockReturnValue(normalizedSession);

  const result = await authService.login({
    email: " user@example.com ",
    password: "secret",
  });

  expect(httpClientFacade.fetch).toHaveBeenCalledWith("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "user@example.com",
      password: "secret",
    }),
  });
  expect(setSessionSpy).toHaveBeenCalled();
  expect(result).toBe(normalizedSession);
});
```

Add a failure-path test beside the happy path:
- invalid API response
- `401` or `403`
- network failure
- malformed payload

## Unit Test Example: HTTP Client Facade

Use this pattern when testing wrappers around `fetch`, `axios`, or request interceptors.

Real file:
- `__tests__/unit/services/client.test.ts`

What it does:
- spies on `axios.request`
- verifies URL normalization and body forwarding
- verifies retry and error translation behavior

Example:

```ts
import { jest } from "@jest/globals";
import axios from "axios";
import { httpClientFacade } from "../../../src/services/client";

it("translates fetch requests through axios and returns a Response", async () => {
  jest.spyOn(axios, "request").mockResolvedValue({
    status: 202,
    statusText: "Accepted",
    data: "accepted",
    headers: { "content-type": "text/plain" },
  });

  const client = httpClientFacade.registerSource("request-source", {
    baseUrl: "api.quietwealth.example",
    credentials: "include",
    scope: "request-source",
  });

  const response = await client.fetch("/documents", {
    method: "POST",
    body: JSON.stringify({ id: "doc-1" }),
  });

  expect(axios.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://api.quietwealth.example/documents",
      method: "POST",
      data: JSON.stringify({ id: "doc-1" }),
      withCredentials: true,
    }),
  );
  await expect(response.text()).resolves.toBe("accepted");
});
```

This is the right level for:
- `HttpClientFacade`
- interceptors
- retry behavior
- wrapper helpers such as `apiJson` and `authJson`

## Unit Test Example: Zod Validation

Use this pattern when the target is a schema or parser.

Real file:
- `__tests__/unit/validation/auth-schemas.test.ts`

What it does:
- verifies valid payloads succeed
- verifies invalid payloads fail
- verifies the returned error shape

Example:

```ts
import { loginRequestSchema } from "../../../src/auth/auth-schemas";

it("accepts valid auth payloads and rejects invalid ones", () => {
  expect(
    loginRequestSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    }).success,
  ).toBe(true);

  const invalidLogin = loginRequestSchema.safeParse({
    email: "bad-email",
    password: "",
  });

  expect(invalidLogin.success).toBe(false);
  if (!invalidLogin.success) {
    expect(invalidLogin.error.flatten().fieldErrors).toEqual({
      email: expect.any(Array),
      password: expect.any(Array),
    });
  }
});
```

For schemas, always cover:
- a valid payload
- one invalid payload per major rule
- the exact error shape consumed by the UI or service layer

## Component Test Template

There is no primitive `Button` component in `src` yet, but when one is added, keep the test in `__tests__/unit/components/` and follow the same Jest setup already used in this repo.

Example:

```tsx
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../../src/components/primitives/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows the loading state", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("triggers the click handler", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

Prefer:
- `getByRole` over brittle CSS selectors
- `userEvent` over manual DOM event dispatch
- visible behavior over implementation details

## Playwright Integration Test Examples

The current files in `__tests__/e2e` are scaffolds with `test.describe.skip(...)`. Replace the placeholder body with a real flow when the screen exists.

Before writing a flow:

1. Start the app with a stable base URL.
2. Seed or mock the backend response required for the journey.
3. Use stable selectors such as `data-testid`.
4. Assert both user-visible UI and route transitions.

### Login Flow

File:
- `__tests__/e2e/login.spec.ts`

Example:

```ts
import { expect, test } from "@playwright/test";

test("authenticates a user and lands on the home route", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        userId: "user-1",
        email: "user@example.com",
        tenantIds: [],
        tenantRoles: [],
      }),
    });
  });

  await page.goto("/login");
  await page.getByTestId("login-email").fill("user@example.com");
  await page.getByTestId("login-password").fill("secret");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText("user@example.com")).toBeVisible();
});
```

### Marketplace Flow

File:
- `__tests__/e2e/marketplace.spec.ts`

Example:

```ts
import { expect, test } from "@playwright/test";

test("loads marketplace data and shows the results grid", async ({ page }) => {
  await page.route("**/api/marketplace*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          { id: "offer-1", title: "Tax review" },
          { id: "offer-2", title: "Portfolio planning" },
        ],
      }),
    });
  });

  await page.goto("/marketplace");

  await expect(page.getByTestId("marketplace-grid")).toBeVisible();
  await expect(page.getByText("Tax review")).toBeVisible();
  await expect(page.getByText("Portfolio planning")).toBeVisible();
});
```

### Document Upload Flow

File:
- `__tests__/e2e/document-upload.spec.ts`

Example:

```ts
import path from "node:path";
import { expect, test } from "@playwright/test";

test("uploads a document and shows progress feedback", async ({ page }) => {
  await page.route("**/api/documents/upload", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ documentId: "doc-1", status: "queued" }),
    });
  });

  await page.goto("/documents/upload");
  await page.getByTestId("document-file-input").setInputFiles(
    path.resolve("fixtures", "sample.pdf"),
  );
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page.getByText("Uploading")).toBeVisible();
  await expect(page.getByText("Queued")).toBeVisible();
});
```

### Expert Validation Flow

File:
- `__tests__/e2e/expert-validation.spec.ts`

Example:

```ts
import { expect, test } from "@playwright/test";

test("opens a validation task and submits the review outcome", async ({ page }) => {
  await page.route("**/api/expert-validation/tasks*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{ id: "task-1", title: "Review application 42" }],
      }),
    });
  });

  await page.route("**/api/expert-validation/tasks/task-1/decision", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/expert-validation");
  await page.getByText("Review application 42").click();
  await page.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText("Decision saved")).toBeVisible();
});
```

## Checklist For New Tests

- Put the test beside the correct layer under `__tests__/unit` or `__tests__/e2e`.
- Mock external boundaries such as HTTP, auth, router state, browser location, and time.
- Add one happy-path assertion and at least one failure-path assertion.
- Use stable selectors and visible behavior.
- Run the narrowest command first, then `npm run test:ci` before merging Jest changes.
