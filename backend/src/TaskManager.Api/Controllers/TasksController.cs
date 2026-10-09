using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Common;
using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Dtos;
using TaskManager.Application.Tasks.Queries.GetTaskById;
using TaskManager.Application.Tasks.Queries.ListTasks;
using TaskManager.Domain.Tasks;

namespace TaskManager.Api.Controllers;

/// <summary>Consulta de tareas personales.</summary>
/// <remarks>
/// Controller "delgado": traduce HTTP a un caso de uso y nada más. Las reglas viven en
/// Aplicación y los errores se traducen en <c>GlobalExceptionHandler</c>.
/// </remarks>
[ApiController]
[Route("api/v1/tasks")]
public sealed class TasksController : ControllerBase
{
    /// <summary>Lista tareas, opcionalmente filtradas por estado y/o prioridad.</summary>
    /// <param name="handler">Caso de uso (inyectado por acción para no instanciar los que no se usan).</param>
    /// <param name="status">Pending | InProgress | Completed. Omitir = todos.</param>
    /// <param name="priority">Low | Medium | High. Omitir = todas.</param>
    /// <param name="page">Número de página (base 1).</param>
    /// <param name="pageSize">Elementos por página (1-100).</param>
    /// <param name="cancellationToken">Se cancela si el cliente aborta la petición.</param>
    /// <response code="200">Página de tareas ordenadas por prioridad y fecha.</response>
    /// <response code="400">Algún parámetro es inválido.</response>
    [HttpGet]
    [ProducesResponseType<PagedResult<TaskSummaryDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<TaskSummaryDto>>> List(
        [FromServices] IQueryHandler<ListTasksQuery, PagedResult<TaskSummaryDto>> handler,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] int page = ListTasksQuery.DefaultPageNumber,
        [FromQuery] int pageSize = ListTasksQuery.DefaultPageSize,
        CancellationToken cancellationToken = default)
    {
        var result = await handler.HandleAsync(new ListTasksQuery(status, priority, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Obtiene el detalle de una tarea.</summary>
    /// <param name="handler">Caso de uso.</param>
    /// <param name="id">Identificador de la tarea.</param>
    /// <param name="cancellationToken">Se cancela si el cliente aborta la petición.</param>
    /// <response code="200">Detalle de la tarea.</response>
    /// <response code="404">La tarea no existe.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType<TaskDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> GetById(
        [FromServices] IQueryHandler<GetTaskByIdQuery, TaskDetailDto> handler,
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(new GetTaskByIdQuery(id), cancellationToken);
        return Ok(result);
    }
}
