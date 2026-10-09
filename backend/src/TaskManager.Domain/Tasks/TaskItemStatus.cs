namespace TaskManager.Domain.Tasks;

/// <summary>
/// Estado de una tarea. Los valores numéricos son contrato con la tabla <c>tasks.TaskStatus</c>.
/// Se llama <c>TaskItemStatus</c> para no colisionar con <see cref="System.Threading.Tasks.TaskStatus"/>.
/// </summary>
public enum TaskItemStatus : byte
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
}
