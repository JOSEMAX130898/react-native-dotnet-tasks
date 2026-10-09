using TaskManager.Application.Common.Models;

namespace TaskManager.UnitTests.Application;

public sealed class PagedResultTests
{
    [Theory]
    [InlineData(0, 20, 0)]
    [InlineData(1, 20, 1)]
    [InlineData(20, 20, 1)]
    [InlineData(21, 20, 2)]
    [InlineData(100, 10, 10)]
    public void TotalPages_IsCeilingOfTotalOverPageSize(long total, int pageSize, int expected)
    {
        var page = new PagedResult<int>([], 1, pageSize, total);

        Assert.Equal(expected, page.TotalPages);
    }

    [Fact]
    public void Map_KeepsPagingMetadata()
    {
        var page = new PagedResult<int>([1, 2], 2, 2, 5);

        var mapped = page.Map(x => x.ToString(System.Globalization.CultureInfo.InvariantCulture));

        Assert.Equal(["1", "2"], mapped.Items);
        Assert.Equal(2, mapped.PageNumber);
        Assert.Equal(5, mapped.TotalCount);
        Assert.True(mapped.HasNextPage);
    }
}
