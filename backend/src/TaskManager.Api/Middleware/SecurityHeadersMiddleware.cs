namespace TaskManager.Api.Middleware;

/// <summary>Cabeceras de seguridad básicas para una API que solo devuelve JSON.</summary>
/// <remarks>
/// Se aplican en <c>OnStarting</c> (justo antes de enviar la respuesta) y no al entrar:
/// el manejador de excepciones limpia las cabeceras al reescribir la respuesta, y así
/// también las respuestas de error (400/404/500) quedan protegidas.
/// </remarks>
internal sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(
            static state =>
            {
                var httpContext = (HttpContext)state;
                var headers = httpContext.Response.Headers;
                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "DENY";
                headers["Referrer-Policy"] = "no-referrer";

                // Swagger UI necesita cargar sus scripts; el resto de respuestas no.
                if (!httpContext.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase))
                {
                    headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
                }

                return Task.CompletedTask;
            },
            context);

        return next(context);
    }
}
