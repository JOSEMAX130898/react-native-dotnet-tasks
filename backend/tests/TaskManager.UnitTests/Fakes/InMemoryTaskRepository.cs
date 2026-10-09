using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Ports;
using TaskManager.Domain.Tasks;

namespace TaskManager.UnitTests.Fakes;

/// <summary>
/// Fake del puerto que replica la semántica del SP (filtros, orden y paginación).
/// Un fake hecho a mano es más legible que un mock y documenta el contrato esperado.
/// </summary>
internal sealed class InMemoryTaskRepository(IEnumerable<TaskItem> tasks) : ITaskRepository
{
    private readonly List<TaskItem> _tasks = tasks.ToList();

    public TaskSearchCriteria? LastCriteria { get; private set; }

    public Task<PagedResult<TaskItem>> SearchAsync(TaskSearchCriteria criteria, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        LastCriteria = criteria;

        var filtered = _tasks
            .Where(t => criteria.Status is null || t.Status == criteria.Status)
            .Where(t => criteria.Priority is null || t.Priority == criteria.Priority)
            .OrderByDescending(t => t.Priority)
            .ThenByDescending(t => t.CreatedAtUtc)
            .ThenByDescending(t => t.Id)
            .ToList();

        var page = filtered
            .Skip((criteria.PageNumber - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToList();

        return Task.FromResult(new PagedResult<TaskItem>(page, criteria.PageNumber, criteria.PageSize, filtered.Count));
    }

    public Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(_tasks.FirstOrDefault(t => t.Id == id));
    }
}
