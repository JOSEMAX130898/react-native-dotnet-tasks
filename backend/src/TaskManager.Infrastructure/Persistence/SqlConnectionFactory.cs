using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace TaskManager.Infrastructure.Persistence;

/// <summary>Único punto del código que conoce el proveedor de SQL Server.</summary>
internal sealed class SqlConnectionFactory(IOptions<DatabaseOptions> options) : IDbConnectionFactory
{
    private readonly string _connectionString = options.Value.ConnectionString;

    public DbConnection CreateConnection() => new SqlConnection(_connectionString);
}
