using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Dtos;

/// <summary>Proyección completa para la pantalla de detalle.</summary>
public sealed record TaskDetailDto(
    int Id,
    string Title,
    string? Description,
    TaskPriority Priority,
    TaskItemStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
