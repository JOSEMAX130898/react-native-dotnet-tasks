using System.Data.Common;

namespace TaskManager.Infrastructure.Persistence;

/// <summary>
/// Crea conexiones nuevas (el pool de ADO.NET las reutiliza por debajo).
/// Abstraer la fábrica aísla el proveedor concreto en un solo archivo: el repositorio
/// trabaja con <see cref="DbConnection"/> y cambiar a otro motor no lo toca.
/// </summary>
public interface IDbConnectionFactory
{
    DbConnection CreateConnection();
}
