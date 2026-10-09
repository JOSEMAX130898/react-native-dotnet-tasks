using System.Net;
using System.Text.Json;

namespace TaskManager.Api.IntegrationTests;

public sealed class TasksEndpointsTests(TaskApiFactory factory) : IClassFixture<TaskApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response)
    {
        await using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return document.RootElement.Clone();
    }

    [Fact]
    public async Task List_ReturnsPagedContract_WithEnumsAsStrings()
    {
        var response = await _client.GetAsync(new Uri("/api/v1/tasks", UriKind.Relative));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJsonAsync(response);
        Assert.Equal(3, json.GetProperty("totalCount").GetInt64());
        Assert.Equal(1, json.GetProperty("pageNumber").GetInt32());
        Assert.True(json.TryGetProperty("hasNextPage", out _));
        var first = json.GetProperty("items")[0];
        Assert.Equal("High", first.GetProperty("priority").GetString());
        Assert.Equal("Pending", first.GetProperty("status").GetString());
        Assert.False(first.TryGetProperty("description", out _));
    }

    [Theory]
    [InlineData("status=Completed", 1)]
    [InlineData("status=completed", 1)]
    [InlineData("priority=Medium", 1)]
    [InlineData("status=Pending&priority=Low", 0)]
    public async Task List_AppliesFilters(string queryString, int expectedCount)
    {
        var response = await _client.GetAsync(new Uri($"/api/v1/tasks?{queryString}", UriKind.Relative));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJsonAsync(response);
        Assert.Equal(expectedCount, json.GetProperty("items").GetArrayLength());
    }

    [Theory]
    [InlineData("status=Unknown")]
    [InlineData("status=99")]
    [InlineData("priority=Urgent")]
    [InlineData("page=0")]
    [InlineData("pageSize=500")]
    public async Task List_InvalidParameters_Returns400ProblemDetails(string queryString)
    {
        var response = await _client.GetAsync(new Uri($"/api/v1/tasks?{queryString}", UriKind.Relative));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var json = await ReadJsonAsync(response);
        Assert.True(json.TryGetProperty("errors", out _));
    }

    [Fact]
    public async Task GetById_Existing_ReturnsDetailWithDescription()
    {
        var response = await _client.GetAsync(new Uri("/api/v1/tasks/1", UriKind.Relative));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await ReadJsonAsync(response);
        Assert.Equal("Alta pendiente", json.GetProperty("title").GetString());
        Assert.Equal("Desc 1", json.GetProperty("description").GetString());
    }

    [Fact]
    public async Task GetById_Missing_Returns404ProblemDetails()
    {
        var response = await _client.GetAsync(new Uri("/api/v1/tasks/999", UriKind.Relative));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var json = await ReadJsonAsync(response);
        Assert.True(json.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task GetById_NonPositiveId_Returns400()
    {
        var response = await _client.GetAsync(new Uri("/api/v1/tasks/0", UriKind.Relative));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Responses_IncludeSecurityHeaders()
    {
        var response = await _client.GetAsync(new Uri("/api/v1/tasks", UriKind.Relative));

        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task LivenessProbe_Returns200()
    {
        var response = await _client.GetAsync(new Uri("/health/live", UriKind.Relative));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
