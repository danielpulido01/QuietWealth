using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using QuietWealth.Bakend.Shared.Errors;

namespace QuietWealth.Bakend.Shared.Api;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var correlationId =
            httpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? httpContext.TraceIdentifier;

        try
        {
            logger.LogError(
                exception,
                "Unhandled exception. CorrelationId: {CorrelationId}",
                correlationId);
        }
        catch
        {
        }

        var (status, title, type, category, detail, errorCode, retryable) = exception switch
        {
            DomainNotFoundException ex => (
                StatusCodes.Status404NotFound,
                "Resource not found",
                "https://api.quietwealth/errors/domain-not-found",
                "not-found",
                ex.Message,
                ex.ErrorCode,
                (bool?)null),

            DomainConflictException ex => (
                StatusCodes.Status409Conflict,
                "Conflict",
                "https://api.quietwealth/errors/domain-conflict",
                "conflict",
                ex.Message,
                ex.ErrorCode,
                (bool?)null),

            DomainRuleViolationException ex => (
                StatusCodes.Status409Conflict,
                "Domain rule violated",
                "https://api.quietwealth/errors/domain-rule-violation",
                "domain",
                ex.Message,
                ex.ErrorCode,
                (bool?)null),

            DomainForbiddenException ex => (
                StatusCodes.Status403Forbidden,
                "Forbidden",
                "https://api.quietwealth/errors/forbidden",
                "authorization",
                ex.Message,
                ex.ErrorCode,
                (bool?)null),

            InfrastructureException ex => (
                ex.Retryable ? StatusCodes.Status503ServiceUnavailable : StatusCodes.Status500InternalServerError,
                ex.Retryable ? "Dependency unavailable" : "Infrastructure failure",
                ex.Retryable
                    ? "https://api.quietwealth/errors/dependency-unavailable"
                    : "https://api.quietwealth/errors/infrastructure",
                "infrastructure",
                ex.Retryable
                    ? "A required service is temporarily unavailable. Try again later."
                    : "The request could not be completed.",
                ex.ErrorCode,
                ex.Retryable),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal server error",
                "https://api.quietwealth/errors/unexpected",
                "unexpected",
                "The request could not be completed.",
                "unexpected.internal_server_error",
                (bool?)null)
        };

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title,
            Type = type,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["correlationId"] = correlationId;
        problemDetails.Extensions["errorCode"] = errorCode;
        problemDetails.Extensions["category"] = category;

        if (retryable is not null)
        {
            problemDetails.Extensions["retryable"] = retryable.Value;
        }

        httpContext.Response.StatusCode = status;
        httpContext.Response.ContentType = "application/problem+json";
        httpContext.Response.Headers[CorrelationIdMiddleware.HeaderName] = correlationId;

        var payload = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        await httpContext.Response.WriteAsync(payload, cancellationToken);
        return true;
    }
}
