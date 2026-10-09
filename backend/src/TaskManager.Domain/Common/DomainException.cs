namespace TaskManager.Domain.Common;

/// <summary>
/// Violación de una invariante del dominio. Indica datos que nunca deberían existir
/// (por ejemplo, una tarea sin título), no un error de entrada del usuario.
/// </summary>
public sealed class DomainException : Exception
{
    public DomainException()
    {
    }

    public DomainException(string message)
        : base(message)
    {
    }

    public DomainException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
