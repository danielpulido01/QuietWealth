---
name: backend-api
description: Use when creating or reviewing controllers, services, repositories, or DTOs in the QuietWealth ASP.NET Core 9 backend. Includes exact code patterns from the real codebase.
---

# QuietWealth Backend API Skill

## Stack
- ASP.NET Core 9 (C#)
- Namespace: `QuietWealth.Bakend` (not "Backend")
- Dapper for SQL access
- `IAzureSqlConnectionFactory` for connections
- `ApiResponse<T>` for all responses
- `CorrelationIdMiddleware` for tracing

## Folder Structure per Domain

```
server/QuietWealth.Backend/domains/<domain-name>/
  controllers/   → <Name>Controller.cs
  services/      → I<Name>Service.cs + <Name>Service.cs
  repositories/  → I<Name>Repository.cs + <Name>Repository.cs
  models/        → request/response/entity DTOs
```

---

## Controller – Exact Pattern

```csharp
using QuietWealth.Bakend.Domains.<DomainName>.Models;
using QuietWealth.Bakend.Domains.<DomainName>.Services;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Api;

namespace QuietWealth.Bakend.Domains.<DomainName>.Controllers;

[ApiController]
[Route("api/<route>")]
public sealed class <Name>Controller(I<Name>Service <name>Service) : ControllerBase
{
    [HttpPost("<action>")]
    [ProducesResponseType(typeof(ApiResponse<<ResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<<ResponseDto>>>> <Action>Async(
        [FromBody] <RequestDto> request,
        CancellationToken cancellationToken)
    {
        var response = await <name>Service.<Action>Async(request, cancellationToken);
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? HttpContext.TraceIdentifier;

        return Ok(new ApiResponse<<ResponseDto>>(response, correlationId));
    }
}
```

**Rules:**
- Primary constructor injection (C# 12) — no `private readonly` fields in constructor
- Always include `CancellationToken cancellationToken` as last parameter
- Always return `ApiResponse<T>` with `correlationId`
- Declare all `[ProducesResponseType]` attributes
- Never put business logic, SQL, or blob calls inside a controller

---

## Service – Exact Pattern

```csharp
using QuietWealth.Bakend.Domains.<DomainName>.Models;
using QuietWealth.Bakend.Domains.<DomainName>.Repositories;
using QuietWealth.Bakend.Shared.Errors;

namespace QuietWealth.Bakend.Domains.<DomainName>.Services;

public interface I<Name>Service
{
    Task<<ResponseDto>> <Action>Async(<RequestDto> request, CancellationToken ct = default);
}

public sealed class <Name>Service(I<Name>Repository <name>Repository) : I<Name>Service
{
    public async Task<<ResponseDto>> <Action>Async(<RequestDto> request, CancellationToken ct = default)
    {
        var entity = await <name>Repository.GetByIdAsync(request.Id, ct);

        if (entity is null)
            throw new DomainNotFoundException(
                "The <entity> was not found.",
                "<domain>.<entity>_not_found");

        // business logic here

        return new <ResponseDto>(entity.Id, entity.Name);
    }
}
```

**Rules:**
- `sealed class` always
- Primary constructor injection
- Never access SQL, blobs, or Redis directly — go through repository
- Throw typed domain exceptions, never return `null` silently

---

## Repository – Exact Pattern

```csharp
using QuietWealth.Bakend.Domains.<DomainName>.Models;
using QuietWealth.Bakend.Shared.Errors;
using QuietWealth.Bakend.Shared.Infrastructure;
using Dapper;
using Microsoft.Data.SqlClient;

namespace QuietWealth.Bakend.Domains.<DomainName>.Repositories;

public interface I<Name>Repository
{
    Task<<Entity>?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task CreateAsync(<Entity> entity, CancellationToken ct = default);
}

public sealed class <Name>Repository(IAzureSqlConnectionFactory azureSqlConnectionFactory) : I<Name>Repository
{
    public async Task<<Entity>?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var connectionString = azureSqlConnectionFactory.GetConfiguredConnectionString();
            await using var connection = new SqlConnection(connectionString);
            return await connection.QueryFirstOrDefaultAsync<<Entity>>(
                "SELECT id, user_id, name, created_at FROM <table> WHERE id = @Id",
                new { Id = id });
        }
        catch (InfrastructureException) { throw; }
        catch (Exception ex)
        {
            throw new InfrastructureException(
                "The request could not be completed because Azure SQL is unavailable.",
                "infrastructure.azure_sql_unavailable",
                retryable: true,
                innerException: ex);
        }
    }

    public async Task CreateAsync(<Entity> entity, CancellationToken ct = default)
    {
        try
        {
            var connectionString = azureSqlConnectionFactory.GetConfiguredConnectionString();
            await using var connection = new SqlConnection(connectionString);
            await connection.ExecuteAsync(
                @"INSERT INTO <table> (id, user_id, name, created_at)
                  VALUES (@Id, @UserId, @Name, GETUTCDATE())",
                new { entity.Id, entity.UserId, entity.Name });
        }
        catch (InfrastructureException) { throw; }
        catch (Exception ex)
        {
            throw new InfrastructureException(
                "The request could not be completed because Azure SQL is unavailable.",
                "infrastructure.azure_sql_unavailable",
                retryable: true,
                innerException: ex);
        }
    }
}
```

---

## Error Types

```csharp
// 404 – entity not found
throw new DomainNotFoundException("The X was not found.", "domain.x_not_found");

// 409 – business conflict
throw new DomainConflictException("X already exists.", "domain.x_conflict");

// 403 – forbidden
throw new DomainForbiddenException("Not allowed.", "domain.forbidden");

// 422 – rule violated
throw new DomainRuleViolationException("Rule broken.", "domain.rule_violation");

// 503 – infrastructure down
throw new InfrastructureException("Azure SQL unavailable.", "infrastructure.azure_sql_unavailable", retryable: true, ex);
```

---

## DI Registration

Each domain gets its own extension method — never register in `Program.cs` directly:

```csharp
// domains/<domain-name>/<DomainName>ServiceExtensions.cs
public static class <DomainName>ServiceExtensions
{
    public static IServiceCollection Add<DomainName>Services(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<I<Name>Service, <Name>Service>();
        services.AddScoped<I<Name>Repository, <Name>Repository>();
        return services;
    }
}
```

## Close-Out Checklist

- [ ] Namespace is `QuietWealth.Bakend` (not Backend)
- [ ] Controller uses primary constructor injection
- [ ] Every endpoint returns `ApiResponse<T>` with `correlationId`
- [ ] All `[ProducesResponseType]` attributes declared
- [ ] Repository wraps all exceptions in `InfrastructureException`
- [ ] Service throws typed domain exceptions
- [ ] DI registered via extension method
