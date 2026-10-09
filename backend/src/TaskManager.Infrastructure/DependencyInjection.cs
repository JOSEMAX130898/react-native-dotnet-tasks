using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Tasks.Ports;
using TaskManager.Infrastructure.Persistence;
using TaskManager.Infrastructure.Persistence.Repositories;

namespace TaskManager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // ValidateOnStart: si falta la cadena de conexión la API no arranca
        // (fail fast) en lugar de fallar en la primera petición.
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
        services.AddScoped<ITaskRepository, SqlTaskRepository>();

        return services;
    }
}
