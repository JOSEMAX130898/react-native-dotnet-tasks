using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Common;
using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Dtos;
using TaskManager.Application.Tasks.Queries.GetTaskById;
using TaskManager.Application.Tasks.Queries.ListTasks;

namespace TaskManager.Application;

public static class DependencyInjection
{
    /// <summary>Registra los casos de uso. Son stateless: Scoped por coherencia con el repositorio.</summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IQueryHandler<ListTasksQuery, PagedResult<TaskSummaryDto>>, ListTasksQueryHandler>();
        services.AddScoped<IQueryHandler<GetTaskByIdQuery, TaskDetailDto>, GetTaskByIdQueryHandler>();
        return services;
    }
}
