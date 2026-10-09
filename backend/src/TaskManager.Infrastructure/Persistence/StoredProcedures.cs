namespace TaskManager.Infrastructure.Persistence;

/// <summary>Nombres de los procedimientos almacenados (contrato con database/scripts/03_stored_procedures.sql).</summary>
internal static class StoredProcedures
{
    public const string SearchTasks = "tasks.usp_TaskItem_Search";
    public const string GetTaskById = "tasks.usp_TaskItem_GetById";
}
