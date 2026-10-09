using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.HealthChecks;
using TaskManager.Api.Middleware;

namespace TaskManager.Api.Extensions;

internal static class ServiceCollectionExtensions
{
    public const string CorsPolicyName = "AllowConfiguredOrigins";

    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                // Enums como texto ("High", no 3): contrato legible y estable aunque cambie el orden interno.
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
            })
            .ConfigureApiBehaviorOptions(options =>
                // Errores de model binding (p. ej. "?status=Unknown") con el mismo formato y
                // mensaje que los de validación del caso de uso: el cliente maneja un solo contrato.
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problem = new ValidationProblemDetails(context.ModelState)
                    {
                        Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                        Status = StatusCodes.Status400BadRequest,
                        Title = "La solicitud tiene parámetros inválidos.",
                    };
                    problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
                    return new BadRequestObjectResult(problem) { ContentTypes = { "application/problem+json" } };
                });

        // Errores homogéneos en formato RFC 7807 (application/problem+json).
        services.AddProblemDetails(options =>
            options.CustomizeProblemDetails = context =>
                context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier);
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

        services.AddSwaggerDocumentation();

        // Una app móvil nativa no está sujeta a CORS; esto es para clientes web/Swagger externos.
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        services.AddCors(options => options.AddPolicy(CorsPolicyName, policy =>
            policy.WithOrigins(allowedOrigins).WithMethods("GET").AllowAnyHeader()));

        // Rate limiting por IP: protección básica contra abuso / scraping.
        var permitLimit = configuration.GetValue("RateLimiting:PermitLimitPerMinute", 120);
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = permitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                    }));
        });

        return services;
    }
}
