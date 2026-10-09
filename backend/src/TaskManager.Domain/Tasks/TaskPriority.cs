namespace TaskManager.Domain.Tasks;

/// <summary>
/// Prioridad de una tarea. Los valores numéricos son contrato con la tabla
/// <c>tasks.TaskPriority</c> y permiten ordenar de forma natural (mayor = más urgente).
/// </summary>
public enum TaskPriority : byte
{
    Low = 1,
    Medium = 2,
    High = 3,
}
