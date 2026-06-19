namespace QuietWealth.Bakend.Shared.Errors;

public abstract class AppException : Exception
{
    protected AppException(string message, string errorCode, Exception? innerException = null)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }

    public string ErrorCode { get; }
}

public abstract class DomainException : AppException
{
    protected DomainException(string message, string errorCode, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public sealed class DomainNotFoundException : DomainException
{
    public DomainNotFoundException(string message, string errorCode, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public sealed class DomainConflictException : DomainException
{
    public DomainConflictException(string message, string errorCode, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public sealed class DomainRuleViolationException : DomainException
{
    public DomainRuleViolationException(string message, string errorCode, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public sealed class DomainForbiddenException : DomainException
{
    public DomainForbiddenException(string message, string errorCode, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public sealed class InfrastructureException : AppException
{
    public InfrastructureException(
        string message,
        string errorCode,
        bool retryable = false,
        Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
        Retryable = retryable;
    }

    public bool Retryable { get; }
}
