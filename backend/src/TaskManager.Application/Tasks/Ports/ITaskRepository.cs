using TaskManager.Application.Common.Models;
using TaskManager.Domain.Tasks;

namespace TaskManager.Application.Tasks.Ports;

/// <summary>
/// Puerto de salida (arquitectura hexagonal). La Aplicación define QUÉ necesita;
/// la Infraestructura decide CÓMO (hoy: SQL Server + procedimientos almacenados).
/// </summary>
public interface ITaskRepository
{
    Task<PagedResult<TaskItem>> SearchAsync(TaskSearchCriteria criteria, CancellationToken cancellationToken);

    Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken);
}
