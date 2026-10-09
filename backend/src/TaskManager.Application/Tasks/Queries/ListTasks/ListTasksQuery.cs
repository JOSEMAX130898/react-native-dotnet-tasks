using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Queries.ListTasks;

/// <summary>Listar tareas con filtros opcionales de estado y prioridad, paginado.</summary>
public sealed record ListTasksQuery(
    TaskItemStatus? Status = null,
    TaskPriority? Priority = null,
    int PageNumber = ListTasksQuery.DefaultPageNumber,
    int PageSize = ListTasksQuery.DefaultPageSize)
{
    public const int DefaultPageNumber = 1;
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;
}
