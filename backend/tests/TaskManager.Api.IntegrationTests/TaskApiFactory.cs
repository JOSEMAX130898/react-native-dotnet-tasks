using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Ports;
using TaskManager.Domain.Tasks;

namespace TaskManager.Api.IntegrationTests;

/// <summary>
/// Levanta la API real en memoria (pipeline, routing, serialización, manejo de errores)
/// reemplazando solo el adaptador de salida. Valida el contrato HTTP sin necesitar SQL Server:
/// es la ventaja práctica de la arquitectura hexagonal.
/// </summary>
public sealed class TaskApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        // Las opciones se validan al arrancar (fail fast); el valor no se usa porque el repositorio se reemplaza.
        builder.UseSetting("Database:ConnectionString", "Server=unused;Database=unused");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<ITaskRepository>();
            services.AddSingleton<ITaskRepository, StubTaskRepository>();
        });
    }

    private sealed class StubTaskRepository : ITaskRepository
    {
        private static readonly DateTime Created = new(2026, 2, 1, 9, 0, 0, DateTimeKind.Utc);

        private static readonly TaskItem[] Tasks =
        [
            TaskItem.Create(1, "Alta pendiente", "Desc 1", TaskPriority.High, TaskItemStatus.Pending, Created),
            TaskItem.Create(2, "Media en progreso", null, TaskPriority.Medium, TaskItemStatus.InProgress, Created),
            TaskItem.Create(3, "Baja completada", "Desc 3", TaskPriority.Low, TaskItemStatus.Completed, Created),
        ];

        public Task<PagedResult<TaskItem>> SearchAsync(TaskSearchCriteria criteria, CancellationToken cancellationToken)
        {
            var items = Tasks
                .Where(t => criteria.Status is null || t.Status == criteria.Status)
                .Where(t => criteria.Priority is null || t.Priority == criteria.Priority)
                .ToList();
            return Task.FromResult(new PagedResult<TaskItem>(items, criteria.PageNumber, criteria.PageSize, items.Count));
        }

        public Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(Tasks.FirstOrDefault(t => t.Id == id));
    }
}

internal static class ServiceCollectionTestExtensions
{
    public static void RemoveAll<T>(this IServiceCollection services)
    {
        foreach (var descriptor in services.Where(d => d.ServiceType == typeof(T)).ToList())
        {
            services.Remove(descriptor);
        }
    }
}
