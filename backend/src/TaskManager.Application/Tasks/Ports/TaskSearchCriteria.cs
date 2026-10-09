using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Ports;

/// <summary>Criterios ya validados que el caso de uso entrega al repositorio.</summary>
public sealed record TaskSearchCriteria(
    TaskItemStatus? Status,
    TaskPriority? Priority,
    int PageNumber,
    int PageSize);
