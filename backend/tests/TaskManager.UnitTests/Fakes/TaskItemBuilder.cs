using TaskManager.Domain.Tasks;

namespace TaskManager.UnitTests.Fakes;

/// <summary>Test Data Builder: valores válidos por defecto; cada test cambia solo lo que le importa.</summary>
internal sealed class TaskItemBuilder
{
    private int _id = 1;
    private string _title = "Tarea de prueba";
    private string? _description = "Descripción";
    private TaskPriority _priority = TaskPriority.Medium;
    private TaskItemStatus _status = TaskItemStatus.Pending;
    private DateTime _createdAt = new(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);
    private DateTime? _updatedAt;

    public TaskItemBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public TaskItemBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public TaskItemBuilder WithDescription(string? description)
    {
        _description = description;
        return this;
    }

    public TaskItemBuilder WithPriority(TaskPriority priority)
    {
        _priority = priority;
        return this;
    }

    public TaskItemBuilder WithStatus(TaskItemStatus status)
    {
        _status = status;
        return this;
    }

    public TaskItemBuilder CreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public TaskItemBuilder UpdatedAt(DateTime? updatedAt)
    {
        _updatedAt = updatedAt;
        return this;
    }

    public TaskItem Build() => TaskItem.Create(_id, _title, _description, _priority, _status, _createdAt, _updatedAt);
}
