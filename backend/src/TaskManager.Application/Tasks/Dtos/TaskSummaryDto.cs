using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Dtos;

/// <summary>
/// Proyección para listas. No incluye la descripción (hasta 2000 caracteres) para
/// reducir el payload que viaja a un dispositivo móvil en cada página.
/// </summary>
public sealed record TaskSummaryDto(
    int Id,
    string Title,
    TaskPriority Priority,
    TaskItemStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
