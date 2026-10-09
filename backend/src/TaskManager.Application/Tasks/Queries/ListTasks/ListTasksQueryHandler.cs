using TaskManager.Application.Common;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Dtos;
using TaskManager.Application.Tasks.Ports;

namespace TaskManager.Application.Tasks.Queries.ListTasks;

public sealed class ListTasksQueryHandler(ITaskRepository repository)
    : IQueryHandler<ListTasksQuery, PagedResult<TaskSummaryDto>>
{
    public async Task<PagedResult<TaskSummaryDto>> HandleAsync(ListTasksQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var errors = ListTasksQueryValidator.Validate(query);
        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        var criteria = new TaskSearchCriteria(query.Status, query.Priority, query.PageNumber, query.PageSize);
        var page = await repository.SearchAsync(criteria, cancellationToken).ConfigureAwait(false);

        return page.Map(task => task.ToSummaryDto());
    }
}
