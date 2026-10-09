using Microsoft.Extensions.Diagnostics.HealthChecks;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Api.HealthChecks;

/// <summary>Readiness: verifica que la base de datos acepta conexiones.</summary>
internal sealed class DatabaseHealthCheck(IDbConnectionFactory connectionFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = connectionFactory.CreateConnection();
            await connection.OpenAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT 1";
            await command.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
#pragma warning disable CA1031 // Un health check debe reportar cualquier fallo, no propagarlo.
        catch (Exception ex)
#pragma warning restore CA1031
        {
            return HealthCheckResult.Unhealthy("No se pudo conectar a la base de datos.", ex);
        }
    }
}
