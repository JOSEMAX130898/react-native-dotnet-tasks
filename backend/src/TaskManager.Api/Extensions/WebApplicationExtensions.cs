using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using TaskManager.Api.Middleware;

namespace TaskManager.Api.Extensions;

internal static class WebApplicationExtensions
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        // El orden importa: las cabeceras de seguridad se registran primero para cubrir
        // cualquier respuesta, y el manejador de excepciones envuelve todo lo demás.
        app.UseMiddleware<SecurityHeadersMiddleware>();
        app.UseExceptionHandler();
        app.UseStatusCodePages();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwaggerDocumentation();
        }
        else
        {
            app.UseHsts();
            app.UseHttpsRedirection();
        }

        app.UseCors(ServiceCollectionExtensions.CorsPolicyName);
        app.UseRateLimiter();

        app.MapControllers();

        // Liveness: el proceso responde. Readiness: además llega a la base de datos.
        app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
        app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });

        return app;
    }
}
