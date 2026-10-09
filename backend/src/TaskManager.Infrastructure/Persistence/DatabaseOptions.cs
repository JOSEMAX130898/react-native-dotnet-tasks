using System.ComponentModel.DataAnnotations;

namespace TaskManager.Infrastructure.Persistence;

/// <summary>Configuración tipada de la base de datos (sección "Database" del appsettings).</summary>
public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required(AllowEmptyStrings = false)]
    public string ConnectionString { get; set; } = string.Empty;

    [Range(1, 300)]
    public int CommandTimeoutSeconds { get; set; } = 30;
}
