---
name: testing
description: Use when creating or reviewing tests in QuietWealth. Includes exact xUnit, Jest, and Playwright patterns from the real codebase with naming conventions and mock strategies.
---

# QuietWealth Testing Skill

## Test Stack
- **Backend:** xUnit + Moq (C#)
- **Frontend:** Jest + React Testing Library (TypeScript)
- **E2E:** Playwright

## Test Locations
```
server/tests/QuietWealth.Backend.UnitTests/    → xUnit unit tests
server/tests/QuietWealth.Backend.ApiTests/     → xUnit API/integration tests
app/__tests__/unit/                            → Jest unit tests
app/__tests__/integration/                     → Jest integration tests
app/__tests__/e2e/                             → Playwright E2E tests
```

---

## Naming Convention

```
MethodName_Condition_ExpectedResult

RequestPasswordReset_ValidEmail_StoresTokenInDatabase 
ConfirmPasswordReset_ExpiredToken_ThrowsDomainException
GetByIdAsync_EntityNotFound_ThrowsDomainNotFoundException 
LoginAsync_InvalidCredentials_ReturnsFalse 
renders_email_input_correctly  (Jest/component tests)
```

---

## xUnit – Service Unit Test Pattern

```csharp
using Moq;
using Xunit;
using QuietWealth.Bakend.Domains.<DomainName>.Services;
using QuietWealth.Bakend.Domains.<DomainName>.Repositories;
using QuietWealth.Bakend.Domains.<DomainName>.Models;
using QuietWealth.Bakend.Shared.Errors;

namespace QuietWealth.Backend.UnitTests.<DomainName>;

public sealed class <Name>ServiceTests
{
    private readonly Mock<I<Name>Repository> _repositoryMock = new();
    private readonly <Name>Service _sut;

    public <Name>ServiceTests()
    {
        _sut = new <Name>Service(_repositoryMock.Object);
    }

    [Fact]
    public async Task <Action>Async_ValidInput_Returns<Result>()
    {
        // Arrange
        var request = new <Request>Dto { Id = Guid.NewGuid() };
        var entity = new <Entity> { Id = request.Id, Name = "Test" };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, default))
            .ReturnsAsync(entity);

        // Act
        var result = await _sut.<Action>Async(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(entity.Id, result.Id);
        _repositoryMock.Verify(r => r.GetByIdAsync(request.Id, default), Times.Once);
    }

    [Fact]
    public async Task <Action>Async_EntityNotFound_ThrowsDomainNotFoundException()
    {
        // Arrange
        var request = new <Request>Dto { Id = Guid.NewGuid() };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, default))
            .ReturnsAsync((Entity?)null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<DomainNotFoundException>(
            () => _sut.<Action>Async(request));

        Assert.Equal("<domain>.<entity>_not_found", ex.ErrorCode);
    }
}
```

---

## xUnit – Repository Unit Test Pattern

```csharp
public sealed class <Name>RepositoryTests
{
    private readonly Mock<IAzureSqlConnectionFactory> _sqlFactoryMock = new();
    private readonly <Name>Repository _sut;

    public <Name>RepositoryTests()
    {
        _sut = new <Name>Repository(_sqlFactoryMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_SqlUnavailable_ThrowsInfrastructureException()
    {
        // Arrange
        _sqlFactoryMock
            .Setup(f => f.GetConfiguredConnectionString())
            .Throws(new InvalidOperationException("Connection string missing."));

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InfrastructureException>(
            () => _sut.GetByIdAsync(Guid.NewGuid()));

        Assert.True(ex.Retryable);
        Assert.Equal("infrastructure.azure_sql_unavailable", ex.ErrorCode);
    }
}
```

---

## Jest – Hook Test Pattern

```typescript
// app/__tests__/unit/hooks/use<Name>.test.ts
import { renderHook, act } from "@testing-library/react";
import { use<Name> } from "../../../src/components/hooks/use<Name>";
import { useApplicationServices } from "../../../src/components/hooks/useApplicationServices";

jest.mock("../../../src/components/hooks/useApplicationServices");

const mockUseApplicationServices = useApplicationServices as jest.Mock;

describe("use<Name>", () => {
  const mock<Action> = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationServices.mockReturnValue({
      <service>: {
        <action>: mock<Action>,
        toErrorMessage: jest.fn((_reason, fallback) => fallback),
      },
    });
  });

  it("returns isLoading false initially", () => {
    const { result } = renderHook(() => use<Name>());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets isLoading true while action is pending", async () => {
    mock<Action>.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => use<Name>());

    act(() => { result.current.<action>({ field: "value" }); });

    expect(result.current.isLoading).toBe(true);
  });

  it("returns result on success", async () => {
    mock<Action>.mockResolvedValue({ id: "123" });
    const { result } = renderHook(() => use<Name>());

    let returned: unknown;
    await act(async () => {
      returned = await result.current.<action>({ field: "value" });
    });

    expect(returned).toEqual({ id: "123" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error string on failure", async () => {
    mock<Action>.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => use<Name>());

    await act(async () => {
      await result.current.<action>({ field: "value" });
    });

    expect(result.current.error).toBe("<Action> failed.");
    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## Jest – Component Test Pattern

```typescript
// app/__tests__/unit/<feature>/<Name>.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { <Name> } from "../../../src/components/molecules/<Name>";

describe("<Name>", () => {
  it("renders correctly", () => {
    render(<Name> onClose={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = jest.fn();
    render(<Name> onClose={onClose} onConfirm={jest.fn()} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(<Name> onClose={jest.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
```

---

## Playwright – E2E Pattern

```typescript
// app/__tests__/e2e/<feature>.spec.ts
import { test, expect } from "@playwright/test";

test.describe("<Feature> flow", () => {
  test("user completes <action> successfully", async ({ page }) => {
    await page.goto("/<route>");

    await page.getByPlaceholder("<placeholder>").fill("<value>");
    await page.getByRole("button", { name: "<label>" }).click();

    await expect(page.getByText("<success message>")).toBeVisible();
  });

  test("shows validation error for empty field", async ({ page }) => {
    await page.goto("/<route>");

    await page.getByRole("button", { name: "<label>" }).click();

    await expect(page.getByText("<error message>")).toBeVisible();
  });

  test("shows error when server fails", async ({ page }) => {
    await page.route("**/api/<endpoint>", route =>
      route.fulfill({ status: 500 }));

    await page.goto("/<route>");
    await page.getByRole("button", { name: "<label>" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });
});
```

## Close-Out Checklist

- [ ] Test names follow `MethodName_Condition_ExpectedResult`
- [ ] Both happy path and error path covered
- [ ] Mocks use `jest.clearAllMocks()` in `beforeEach`
- [ ] xUnit tests verify repository calls with `Times.Once`
- [ ] Repository tests verify `InfrastructureException` with `Retryable` and `ErrorCode`
- [ ] Playwright tests cover validation errors and server errors
