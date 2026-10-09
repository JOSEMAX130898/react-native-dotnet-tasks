/* =============================================================================
   01_create_database.sql
   Crea la base de datos TaskManagerDb si no existe. Idempotente.
   Motor: SQL Server 2019+ (probado contra la sintaxis de SQL Server 2022).
============================================================================= */
IF DB_ID(N'TaskManagerDb') IS NULL
BEGIN
    CREATE DATABASE TaskManagerDb;
END
GO

-- Lecturas consistentes sin bloquear a los escritores (útil cuando haya CRUD).
ALTER DATABASE TaskManagerDb SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
GO
