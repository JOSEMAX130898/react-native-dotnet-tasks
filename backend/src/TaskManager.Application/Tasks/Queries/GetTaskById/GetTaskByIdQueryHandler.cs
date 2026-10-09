using TaskManager.Application.Common;
using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.Tasks.Dtos;
using TaskManager.Application.Tasks.Ports;

namespace TaskManager.Application.Tasks.Queries.GetTaskById;

public sealed class GetTaskByIdQueryHandler(ITaskRepository repository)
    : IQueryHandler<GetTaskByIdQuery, TaskDetailDto>
{
    public async Task<TaskDetailDto> HandleAsync(GetTaskByIdQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        if (query.Id <= 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                [nameof(query.Id)] = ["El id debe ser un entero positivo."],
            });
        }

        var task = await repository.GetByIdAsync(query.Id, cancellationToken).ConfigureAwait(false)
            ?? throw NotFoundException.For("Tarea", query.Id);

        return task.ToDetailDto();
    }
}
