using TaskManager.Domain.Common;

namespace TaskManager.Domain.Tasks;

/// <summary>
/// Agregado raíz "Tarea". Es inmutable desde fuera: solo puede construirse a través de
/// <see cref="Create"/>, que garantiza las invariantes. Así ninguna capa puede tener en
/// memoria una tarea inválida, aunque venga de la base de datos.
/// </summary>
public sealed class TaskItem
{
    public const int TitleMaxLength = 150;
    public const int DescriptionMaxLength = 2000;

    private TaskItem(
        int id,
        string title,
        string? description,
        TaskPriority priority,
        TaskItemStatus status,
        DateTime createdAtUtc,
        DateTime? updatedAtUtc)
    {
        Id = id;
        Title = title;
        Description = description;
        Priority = priority;
        Status = status;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = updatedAtUtc;
    }

    public int Id { get; }

    public string Title { get; }

    public string? Description { get; }

    public TaskPriority Priority { get; }

    public TaskItemStatus Status { get; }

    public DateTime CreatedAtUtc { get; }

    public DateTime? UpdatedAtUtc { get; }

    public bool IsCompleted => Status == TaskItemStatus.Completed;

    public static TaskItem Create(
        int id,
        string title,
        string? description,
        TaskPriority priority,
        TaskItemStatus status,
        DateTime createdAtUtc,
        DateTime? updatedAtUtc = null)
    {
        if (id <= 0)
        {
            throw new DomainException($"El id de la tarea debe ser positivo. Valor: {id}.");
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new DomainException("La tarea debe tener un título.");
        }

        var normalizedTitle = title.Trim();
        if (normalizedTitle.Length > TitleMaxLength)
        {
            throw new DomainException($"El título no puede superar {TitleMaxLength} caracteres.");
        }

        var normalizedDescription = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (normalizedDescription?.Length > DescriptionMaxLength)
        {
            throw new DomainException($"La descripción no puede superar {DescriptionMaxLength} caracteres.");
        }

        if (!Enum.IsDefined(priority))
        {
            throw new DomainException($"Prioridad desconocida: {priority}.");
        }

        if (!Enum.IsDefined(status))
        {
            throw new DomainException($"Estado desconocido: {status}.");
        }

        if (updatedAtUtc is not null && updatedAtUtc < createdAtUtc)
        {
            throw new DomainException("La fecha de actualización no puede ser anterior a la de creación.");
        }

        return new TaskItem(
            id,
            normalizedTitle,
            normalizedDescription,
            priority,
            status,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc),
            updatedAtUtc is null ? null : DateTime.SpecifyKind(updatedAtUtc.Value, DateTimeKind.Utc));
    }
}
