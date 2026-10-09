namespace TaskManager.Application.Common.Exceptions;

/// <summary>
/// La entrada de un caso de uso no es válida. La capa Api la traduce a HTTP 400
/// con el detalle por campo (RFC 7807 / ValidationProblemDetails).
/// </summary>
public sealed class ValidationException : Exception
{
    public ValidationException()
        : this(new Dictionary<string, string[]>())
    {
    }

    public ValidationException(string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("Uno o más parámetros no son válidos.")
    {
        Errors = errors;
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }
}
