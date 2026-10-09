namespace TaskManager.Application.Common.Models;

/// <summary>Página de resultados con la metadata necesaria para paginar en el cliente.</summary>
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int PageNumber, int PageSize, long TotalCount)
{
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);

    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResult<TOut> Map<TOut>(Func<T, TOut> selector)
    {
        ArgumentNullException.ThrowIfNull(selector);
        return new PagedResult<TOut>(Items.Select(selector).ToList(), PageNumber, PageSize, TotalCount);
    }
}
