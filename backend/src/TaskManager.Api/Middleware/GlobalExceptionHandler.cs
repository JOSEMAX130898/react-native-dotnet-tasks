using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Common.Exceptions;

namespace TaskManager.Api.Middleware;

/// <summary>
/// Traduce excepciones a respuestas HTTP en un único lugar. Los controllers quedan
/// limpios (sin try/catch) y nunca se filtra un stack trace al cliente.
/// </summary>
internal sealed partial class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    /// <summary>Código no estándar (nginx) para "el cliente cerró la conexión".</summary>
    private const int ClientClosedRequest = 499;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        ProblemDetails problem;

        switch (exception)
        {
            case ValidationException validation:
                problem = new ValidationProblemDetails(validation.Errors.ToDictionary(e => e.Key, e => e.Value))
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "La solicitud tiene parámetros inválidos.",
                };
                break;

            case NotFoundException notFound:
                problem = new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Recurso no encontrado.",
                    Detail = notFound.Message,
                };
                break;

            case OperationCanceledException when httpContext.RequestAborted.IsCancellationRequested:
                // La app canceló (p. ej. cambió de filtro): no es un error del servidor.
                LogRequestCancelled(logger, httpContext.Request.Path);
                httpContext.Response.StatusCode = ClientClosedRequest;
                return true;

            default:
                LogUnhandledException(logger, exception, httpContext.Request.Method, httpContext.Request.Path);
                problem = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = "Ocurrió un error inesperado.",
                    Detail = "Intenta nuevamente más tarde. Si persiste, comparte el traceId con soporte.",
                };
                break;
        }

        httpContext.Response.StatusCode = problem.Status!.Value;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception,
        });
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Request {Path} cancelada por el cliente.")]
    private static partial void LogRequestCancelled(ILogger logger, PathString path);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error no controlado en {Method} {Path}.")]
    private static partial void LogUnhandledException(ILogger logger, Exception exception, string method, PathString path);
}
