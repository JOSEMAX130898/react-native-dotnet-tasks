using TaskManager.Api.Extensions;
using TaskManager.Application;
using TaskManager.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseApiPipeline();

await app.RunAsync();

/// <summary>Expuesto para las pruebas de integración (WebApplicationFactory).</summary>
public partial class Program;
