using TaskManager.Domain.Common;
using TaskManager.Domain.Tasks;

namespace TaskManager.UnitTests.Domain;

public sealed class TaskItemTests
{
    private static readonly DateTime CreatedAt = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_WithValidData_ReturnsTask()
    {
        var task = TaskItem.Create(1, "Pagar luz", "Antes del viernes", TaskPriority.High, TaskItemStatus.Pending, CreatedAt);

        Assert.Equal(1, task.Id);
        Assert.Equal("Pagar luz", task.Title);
        Assert.Equal(TaskPriority.High, task.Priority);
        Assert.False(task.IsCompleted);
    }

    [Fact]
    public void Create_TrimsTitleAndDescription()
    {
        var task = TaskItem.Create(1, "  Título  ", "  Desc  ", TaskPriority.Low, TaskItemStatus.Pending, CreatedAt);

        Assert.Equal("Título", task.Title);
        Assert.Equal("Desc", task.Description);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_BlankDescription_IsNormalizedToNull(string? description)
    {
        var task = TaskItem.Create(1, "Título", description, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt);

        Assert.Null(task.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_BlankTitle_Throws(string title)
    {
        Assert.Throws<DomainException>(() =>
            TaskItem.Create(1, title, null, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt));
    }

    [Fact]
    public void Create_TitleAtMaxLength_IsAccepted()
    {
        var title = new string('a', TaskItem.TitleMaxLength);

        var task = TaskItem.Create(1, title, null, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt);

        Assert.Equal(TaskItem.TitleMaxLength, task.Title.Length);
    }

    [Fact]
    public void Create_TitleOverMaxLength_Throws()
    {
        var title = new string('a', TaskItem.TitleMaxLength + 1);

        Assert.Throws<DomainException>(() =>
            TaskItem.Create(1, title, null, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Create_NonPositiveId_Throws(int id)
    {
        Assert.Throws<DomainException>(() =>
            TaskItem.Create(id, "Título", null, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt));
    }

    [Fact]
    public void Create_UnknownEnumValues_Throw()
    {
        Assert.Throws<DomainException>(() =>
            TaskItem.Create(1, "Título", null, (TaskPriority)9, TaskItemStatus.Pending, CreatedAt));
        Assert.Throws<DomainException>(() =>
            TaskItem.Create(1, "Título", null, TaskPriority.Low, (TaskItemStatus)9, CreatedAt));
    }

    [Fact]
    public void Create_UpdatedBeforeCreated_Throws()
    {
        Assert.Throws<DomainException>(() =>
            TaskItem.Create(1, "Título", null, TaskPriority.Low, TaskItemStatus.Pending, CreatedAt, CreatedAt.AddDays(-1)));
    }

    [Fact]
    public void Create_MarksDatesAsUtc()
    {
        var unspecified = new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Unspecified);

        var task = TaskItem.Create(1, "Título", null, TaskPriority.Low, TaskItemStatus.Completed, unspecified, unspecified);

        Assert.Equal(DateTimeKind.Utc, task.CreatedAtUtc.Kind);
        Assert.Equal(DateTimeKind.Utc, task.UpdatedAtUtc!.Value.Kind);
        Assert.True(task.IsCompleted);
    }
}
