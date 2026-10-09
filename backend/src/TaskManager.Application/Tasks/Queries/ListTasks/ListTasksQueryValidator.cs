namespace TaskManager.Application.Tasks.Queries.ListTasks;

/// <summary>
/// Reglas de entrada del caso de uso. Viven en Aplicación (no en el controller) para que
/// cualquier adaptador de entrada (REST, gRPC, cola) obtenga la misma validación.
/// </summary>
internal static class ListTasksQueryValidator
{
    public static IReadOnlyDictionary<string, string[]> Validate(ListTasksQuery query)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        // Defensa en profundidad: el binder HTTP ya rechaza "?status=99", pero otro adaptador
        // (cola, gRPC, un cast en código) podría entregar un valor de enum no definido.
        if (query.Status is { } status && !Enum.IsDefined(status))
        {
            errors[nameof(query.Status)] = [$"El estado '{status}' no es válido."];
        }

        if (query.Priority is { } priority && !Enum.IsDefined(priority))
        {
            errors[nameof(query.Priority)] = [$"La prioridad '{priority}' no es válida."];
        }

        if (query.PageNumber < 1)
        {
            errors[nameof(query.PageNumber)] = ["El número de página debe ser mayor o igual a 1."];
        }

        if (query.PageSize is < 1 or > ListTasksQuery.MaxPageSize)
        {
            errors[nameof(query.PageSize)] = [$"El tamaño de página debe estar entre 1 y {ListTasksQuery.MaxPageSize}."];
        }

        return errors;
    }
}
