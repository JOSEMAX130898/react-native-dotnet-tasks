using System.Data.Common;
using TaskManager.Domain.Tasks;

namespace TaskManager.Infrastructure.Persistence.Repositories;

/// <summary>
/// Traduce una fila del SP al agregado del dominio. Resuelve los ordinales una sola vez
/// por result set (no por fila) y pasa por <see cref="TaskItem.Create"/>, de modo que
/// un dato corrupto en la BD se detecta aquí en lugar de propagarse a la app.
/// </summary>
internal sealed class TaskRecordReader
{
    private readonly int _id;
    private readonly int _title;
    private readonly int _description;
    private readonly int _statusId;
    private readonly int _priorityId;
    private readonly int _createdAt;
    private readonly int _updatedAt;

    public TaskRecordReader(DbDataReader reader)
    {
        ArgumentNullException.ThrowIfNull(reader);
        _id = reader.GetOrdinal("Id");
        _title = reader.GetOrdinal("Title");
        _description = reader.GetOrdinal("Description");
        _statusId = reader.GetOrdinal("StatusId");
        _priorityId = reader.GetOrdinal("PriorityId");
        _createdAt = reader.GetOrdinal("CreatedAt");
        _updatedAt = reader.GetOrdinal("UpdatedAt");
    }

    public TaskItem Read(DbDataReader reader)
    {
        ArgumentNullException.ThrowIfNull(reader);
        return TaskItem.Create(
            id: reader.GetInt32(_id),
            title: reader.GetString(_title),
            description: reader.IsDBNull(_description) ? null : reader.GetString(_description),
            priority: (TaskPriority)reader.GetByte(_priorityId),
            status: (TaskItemStatus)reader.GetByte(_statusId),
            createdAtUtc: reader.GetDateTime(_createdAt),
            updatedAtUtc: reader.IsDBNull(_updatedAt) ? null : reader.GetDateTime(_updatedAt));
    }
}
