using System.Data;
using System.Data.Common;
using Microsoft.Extensions.Options;
using TaskManager.Application.Common.Models;
using TaskManager.Application.Tasks.Ports;
using TaskManager.Domain.Tasks;

namespace TaskManager.Infrastructure.Persistence.Repositories;

/// <summary>
/// Adaptador del puerto <see cref="ITaskRepository"/> sobre procedimientos almacenados.
/// Usa ADO.NET directo: con SPs el ORM no aporta (no genera SQL) y el mapeo es de
/// 7 columnas. Todas las llamadas son asíncronas y respetan el CancellationToken para
/// que, si la app cancela la petición, la consulta también se cancele en el servidor.
/// </summary>
internal sealed class SqlTaskRepository(IDbConnectionFactory connectionFactory, IOptions<DatabaseOptions> options)
    : ITaskRepository
{
    private readonly int _commandTimeoutSeconds = options.Value.CommandTimeoutSeconds;

    public async Task<PagedResult<TaskItem>> SearchAsync(TaskSearchCriteria criteria, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(criteria);

        var connection = connectionFactory.CreateConnection();
        await using (connection.ConfigureAwait(false))
        {
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var command = CreateCommand(connection, StoredProcedures.SearchTasks);
            await using (command.ConfigureAwait(false))
            {
                command.AddParameter("@StatusId", DbType.Byte, criteria.Status is { } s ? (byte)s : null);
                command.AddParameter("@PriorityId", DbType.Byte, criteria.Priority is { } p ? (byte)p : null);
                command.AddParameter("@PageNumber", DbType.Int32, criteria.PageNumber);
                command.AddParameter("@PageSize", DbType.Int32, criteria.PageSize);

                var reader = await command.ExecuteReaderAsync(CommandBehavior.Default, cancellationToken)
                    .ConfigureAwait(false);
                await using (reader.ConfigureAwait(false))
                {
                    // Result set 1: total.
                    long totalCount = 0;
                    if (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                    {
                        totalCount = reader.GetInt64(0);
                    }

                    // Result set 2: página.
                    var items = new List<TaskItem>(criteria.PageSize);
                    if (await reader.NextResultAsync(cancellationToken).ConfigureAwait(false))
                    {
                        var recordReader = new TaskRecordReader(reader);
                        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                        {
                            items.Add(recordReader.Read(reader));
                        }
                    }

                    return new PagedResult<TaskItem>(items, criteria.PageNumber, criteria.PageSize, totalCount);
                }
            }
        }
    }

    public async Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var connection = connectionFactory.CreateConnection();
        await using (connection.ConfigureAwait(false))
        {
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var command = CreateCommand(connection, StoredProcedures.GetTaskById);
            await using (command.ConfigureAwait(false))
            {
                command.AddParameter("@Id", DbType.Int32, id);

                var reader = await command.ExecuteReaderAsync(CommandBehavior.SingleRow, cancellationToken)
                    .ConfigureAwait(false);
                await using (reader.ConfigureAwait(false))
                {
                    if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                    {
                        return null;
                    }

                    return new TaskRecordReader(reader).Read(reader);
                }
            }
        }
    }

    private DbCommand CreateCommand(DbConnection connection, string storedProcedure)
    {
        var command = connection.CreateCommand();
        command.CommandType = CommandType.StoredProcedure;
        command.CommandText = storedProcedure;
        command.CommandTimeout = _commandTimeoutSeconds;
        return command;
    }
}
