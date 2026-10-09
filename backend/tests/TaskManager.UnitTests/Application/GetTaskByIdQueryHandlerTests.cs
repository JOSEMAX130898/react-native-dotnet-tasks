using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.Tasks.Queries.GetTaskById;
using TaskManager.Domain.Tasks;
using TaskManager.UnitTests.Fakes;

namespace TaskManager.UnitTests.Application;

public sealed class GetTaskByIdQueryHandlerTests
{
    private static readonly DateTime Created = new(2026, 4, 1, 8, 0, 0, DateTimeKind.Utc);

    private readonly GetTaskByIdQueryHandler _sut = new(new InMemoryTaskRepository(
    [
        new TaskItemBuilder().WithId(7).WithTitle("Revisar PR").WithDescription("Detalle completo")
            .WithPriority(TaskPriority.High).WithStatus(TaskItemStatus.InProgress)
            .CreatedAt(Created).UpdatedAt(Created.AddHours(3)).Build(),
    ]));

    [Fact]
    public async Task HandleAsync_ExistingTask_ReturnsDetailWithDescription()
    {
        var result = await _sut.HandleAsync(new GetTaskByIdQuery(7), CancellationToken.None);

        Assert.Equal(7, result.Id);
        Assert.Equal("Revisar PR", result.Title);
        Assert.Equal("Detalle completo", result.Description);
        Assert.Equal(TaskPriority.High, result.Priority);
        Assert.Equal(TaskItemStatus.InProgress, result.Status);
        Assert.Equal(Created, result.CreatedAt);
        Assert.Equal(Created.AddHours(3), result.UpdatedAt);
    }

    [Fact]
    public async Task HandleAsync_MissingTask_ThrowsNotFound()
    {
        await Assert.ThrowsAsync<NotFoundException>(() => _sut.HandleAsync(new GetTaskByIdQuery(404), CancellationToken.None));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task HandleAsync_NonPositiveId_ThrowsValidation(int id)
    {
        var ex = await Assert.ThrowsAsync<ValidationException>(() => _sut.HandleAsync(new GetTaskByIdQuery(id), CancellationToken.None));

        Assert.Contains("Id", ex.Errors.Keys);
    }
}
