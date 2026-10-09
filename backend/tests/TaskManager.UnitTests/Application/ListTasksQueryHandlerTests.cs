using TaskManager.Application.Common.Exceptions;
using TaskManager.Application.Tasks.Queries.ListTasks;
using TaskManager.Domain.Tasks;
using TaskManager.UnitTests.Fakes;

namespace TaskManager.UnitTests.Application;

public sealed class ListTasksQueryHandlerTests
{
    private static readonly DateTime BaseDate = new(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);

    private readonly InMemoryTaskRepository _repository = new(
    [
        new TaskItemBuilder().WithId(1).WithPriority(TaskPriority.Low).WithStatus(TaskItemStatus.Pending).CreatedAt(BaseDate).Build(),
        new TaskItemBuilder().WithId(2).WithPriority(TaskPriority.High).WithStatus(TaskItemStatus.Pending).CreatedAt(BaseDate).Build(),
        new TaskItemBuilder().WithId(3).WithPriority(TaskPriority.High).WithStatus(TaskItemStatus.Completed).CreatedAt(BaseDate.AddDays(1)).Build(),
        new TaskItemBuilder().WithId(4).WithPriority(TaskPriority.Medium).WithStatus(TaskItemStatus.InProgress).CreatedAt(BaseDate).Build(),
        new TaskItemBuilder().WithId(5).WithPriority(TaskPriority.High).WithStatus(TaskItemStatus.Pending).CreatedAt(BaseDate.AddDays(2)).Build(),
    ]);

    private ListTasksQueryHandler CreateSut() => new(_repository);

    [Fact]
    public async Task HandleAsync_WithoutFilters_ReturnsAllOrderedByPriorityThenNewest()
    {
        var result = await CreateSut().HandleAsync(new ListTasksQuery(), CancellationToken.None);

        Assert.Equal(5, result.TotalCount);
        Assert.Equal([5, 3, 2, 4, 1], result.Items.Select(t => t.Id));
    }

    [Fact]
    public async Task HandleAsync_FiltersByStatusAndPriority()
    {
        var query = new ListTasksQuery(TaskItemStatus.Pending, TaskPriority.High);

        var result = await CreateSut().HandleAsync(query, CancellationToken.None);

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, t =>
        {
            Assert.Equal(TaskItemStatus.Pending, t.Status);
            Assert.Equal(TaskPriority.High, t.Priority);
        });
    }

    [Fact]
    public async Task HandleAsync_PassesValidatedCriteriaToRepository()
    {
        await CreateSut().HandleAsync(new ListTasksQuery(TaskItemStatus.Completed, null, 2, 3), CancellationToken.None);

        Assert.NotNull(_repository.LastCriteria);
        Assert.Equal(TaskItemStatus.Completed, _repository.LastCriteria.Status);
        Assert.Null(_repository.LastCriteria.Priority);
        Assert.Equal(2, _repository.LastCriteria.PageNumber);
        Assert.Equal(3, _repository.LastCriteria.PageSize);
    }

    [Fact]
    public async Task HandleAsync_Paginates_AndReportsNextPage()
    {
        var first = await CreateSut().HandleAsync(new ListTasksQuery(PageNumber: 1, PageSize: 2), CancellationToken.None);
        var last = await CreateSut().HandleAsync(new ListTasksQuery(PageNumber: 3, PageSize: 2), CancellationToken.None);

        Assert.Equal(3, first.TotalPages);
        Assert.True(first.HasNextPage);
        Assert.Single(last.Items);
        Assert.False(last.HasNextPage);
    }

    [Fact]
    public async Task HandleAsync_PageBeyondTotal_ReturnsEmptyPageNotError()
    {
        var result = await CreateSut().HandleAsync(new ListTasksQuery(PageNumber: 50), CancellationToken.None);

        Assert.Empty(result.Items);
        Assert.Equal(5, result.TotalCount);
        Assert.False(result.HasNextPage);
    }

    [Fact]
    public async Task HandleAsync_NoMatches_ReturnsEmptyResult()
    {
        var result = await CreateSut().HandleAsync(
            new ListTasksQuery(TaskItemStatus.Completed, TaskPriority.Low), CancellationToken.None);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
        Assert.Equal(0, result.TotalPages);
    }

    [Theory]
    [InlineData(0, 20, "PageNumber")]
    [InlineData(-1, 20, "PageNumber")]
    [InlineData(1, 0, "PageSize")]
    [InlineData(1, 101, "PageSize")]
    public async Task HandleAsync_InvalidPaging_ThrowsValidationException(int page, int pageSize, string expectedField)
    {
        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            CreateSut().HandleAsync(new ListTasksQuery(PageNumber: page, PageSize: pageSize), CancellationToken.None));

        Assert.Contains(expectedField, ex.Errors.Keys);
        Assert.Null(_repository.LastCriteria);
    }

    [Fact]
    public async Task HandleAsync_UndefinedEnumValues_ThrowsValidationException()
    {
        // Equivale a "?status=99&priority=42": el binder lo acepta, el caso de uso no.
        var query = new ListTasksQuery((TaskItemStatus)99, (TaskPriority)42);

        var ex = await Assert.ThrowsAsync<ValidationException>(() => CreateSut().HandleAsync(query, CancellationToken.None));

        Assert.Contains("Status", ex.Errors.Keys);
        Assert.Contains("Priority", ex.Errors.Keys);
    }

    [Fact]
    public async Task HandleAsync_CancelledToken_PropagatesCancellation()
    {
        using var cts = new CancellationTokenSource();
        await cts.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            CreateSut().HandleAsync(new ListTasksQuery(), cts.Token));
    }
}
