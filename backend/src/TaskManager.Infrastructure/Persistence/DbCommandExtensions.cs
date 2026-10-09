using System.Data;
using System.Data.Common;

namespace TaskManager.Infrastructure.Persistence;

internal static class DbCommandExtensions
{
    /// <summary>
    /// Agrega un parámetro tipado. Siempre parámetros, nunca concatenación:
    /// es la defensa principal contra SQL injection y permite reutilizar planes.
    /// </summary>
    public static void AddParameter(this DbCommand command, string name, DbType type, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.DbType = type;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }
}
