using System.Reflection;
using Microsoft.OpenApi.Models;

namespace TaskManager.Api.Extensions;

/// <summary>Documentación OpenAPI. Aislada aquí para poder reemplazar el proveedor sin tocar el resto.</summary>
internal static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Task Manager API",
                Version = "v1",
                Description = "Microservicio de consulta de tareas personales (listado, filtrado y detalle).",
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        return services;
    }

    public static WebApplication UseSwaggerDocumentation(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager API v1"));
        return app;
    }
}
