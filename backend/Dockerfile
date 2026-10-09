# syntax=docker/dockerfile:1
# Build multi-etapa: la imagen final solo tiene el runtime (sin SDK ni código fuente).

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Primero solo los archivos de proyecto: la capa de "restore" se cachea mientras no cambien dependencias.
COPY global.json Directory.Build.props Directory.Packages.props .editorconfig ./
COPY src/TaskManager.Domain/TaskManager.Domain.csproj src/TaskManager.Domain/
COPY src/TaskManager.Application/TaskManager.Application.csproj src/TaskManager.Application/
COPY src/TaskManager.Infrastructure/TaskManager.Infrastructure.csproj src/TaskManager.Infrastructure/
COPY src/TaskManager.Api/TaskManager.Api.csproj src/TaskManager.Api/
RUN dotnet restore src/TaskManager.Api/TaskManager.Api.csproj
COPY src/ src/
RUN dotnet publish src/TaskManager.Api/TaskManager.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
# Usuario sin privilegios incluido en las imágenes oficiales de .NET 8.
USER $APP_UID
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskManager.Api.dll"]
