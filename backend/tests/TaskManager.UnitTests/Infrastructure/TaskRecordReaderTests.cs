using System.Data;
using TaskManager.Domain.Common;
using TaskManager.Domain.Tasks;
using TaskManager.Infrastructure.Persistence.Repositories;

namespace TaskManager.UnitTests.Infrastructure;

/// <summary>
/// Prueba el mapeo fila -> dominio sin base de datos: <see cref="DataTableReader"/> es un
/// <see cref="System.Data.Common.DbDataReader"/> real con las mismas columnas que devuelve el SP.
/// </summary>
public sealed class TaskRecordReaderTests
{
    private static DataTable CreateTable()
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(int));
        table.Columns.Add("Title", typeof(string));
        table.Columns.Add("Description", typeof(string));
        table.Columns.Add("StatusId", typeof(byte));
        table.Columns.Add("PriorityId", typeof(byte));
        table.Columns.Add("CreatedAt", typeof(DateTime));
        table.Columns.Add("UpdatedAt", typeof(DateTime));
        return table;
    }

    [Fact]
    public void Read_MapsAllColumns_IncludingNulls()
    {
        using var table = CreateTable();
        var created = new DateTime(2026, 5, 1, 10, 0, 0);
        table.Rows.Add(10, "Título", DBNull.Value, (byte)2, (byte)3, created, DBNull.Value);

        using var reader = table.CreateDataReader();
        Assert.True(reader.Read());
        var task = new TaskRecordReader(reader).Read(reader);

        Assert.Equal(10, task.Id);
        Assert.Equal("Título", task.Title);
        Assert.Null(task.Description);
        Assert.Equal(TaskItemStatus.InProgress, task.Status);
        Assert.Equal(TaskPriority.High, task.Priority);
        Assert.Equal(DateTimeKind.Utc, task.CreatedAtUtc.Kind);
        Assert.Null(task.UpdatedAtUtc);
    }

    [Fact]
    public void Read_CorruptRow_FailsFastWithDomainException()
    {
        using var table = CreateTable();
        table.Rows.Add(11, "Título", "x", (byte)9, (byte)1, DateTime.UtcNow, DBNull.Value);

        using var reader = table.CreateDataReader();
        Assert.True(reader.Read());

        Assert.Throws<DomainException>(() => new TaskRecordReader(reader).Read(reader));
    }
}
