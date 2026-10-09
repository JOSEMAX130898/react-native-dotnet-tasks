namespace TaskManager.Application.Common;

/// <summary>
/// Contrato mínimo de un caso de uso de lectura (CQRS ligero, sin MediatR).
/// Al ser una interfaz genérica permite agregar decoradores transversales
/// (logging, caché, métricas) sin tocar los handlers.
/// </summary>
public interface IQueryHandler<in TQuery, TResult>
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken);
}
