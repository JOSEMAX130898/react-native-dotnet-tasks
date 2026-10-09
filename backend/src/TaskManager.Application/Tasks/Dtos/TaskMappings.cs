using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Dtos;

/// <summary>
/// Mapeo explícito dominio -> DTO. Se prefiere a AutoMapper: es trivial, se valida en
/// compilación y no oculta lógica (un renombre rompe el build, no producción).
/// </summary>
public static class TaskMappings
{
    public static TaskSummaryDto ToSummaryDto(this TaskItem task)
    {
        ArgumentNullException.ThrowIfNull(task);
        return new TaskSummaryDto(task.Id, task.Title, task.Priority, task.Status, task.CreatedAtUtc, task.UpdatedAtUtc);
    }

    public static TaskDetailDto ToDetailDto(this TaskItem task)
    {
        ArgumentNullException.ThrowIfNull(task);
        return new TaskDetailDto(
            task.Id,
            task.Title,
            task.Description,
            task.Priority,
            task.Status,
            task.CreatedAtUtc,
            task.UpdatedAtUtc);
    }
}
