/* =============================================================================
   03_stored_procedures.sql
   Procedimientos almacenados consumidos por la API. CREATE OR ALTER => idempotente.

   Contrato con la capa de Infraestructura (.NET):
   - tasks.usp_TaskItem_Search  -> 2 result sets: (1) TotalCount, (2) página de filas.
   - tasks.usp_TaskItem_GetById -> 0 o 1 fila.
============================================================================= */
USE TaskManagerDb;
GO

/* -----------------------------------------------------------------------------
   tasks.usp_TaskItem_Search
   Lista tareas filtrando opcionalmente por estado y prioridad, paginado.

   @StatusId / @PriorityId : NULL = sin filtro.
   @PageNumber             : base 1.
   @PageSize               : 1..100 (la API valida; el SP se defiende igual).

   Orden: prioridad DESC, fecha de creación DESC, Id DESC (desempate estable,
   imprescindible para que la paginación OFFSET/FETCH sea determinista).

   OPTION (RECOMPILE): patrón "catch-all" (@p IS NULL OR col = @p). Sin
   recompilar, el plan cacheado para un primer filtro se reutilizaría mal para
   otros (parameter sniffing). Para este volumen el costo de compilar es mínimo.
----------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE tasks.usp_TaskItem_Search
    @StatusId   TINYINT = NULL,
    @PriorityId TINYINT = NULL,
    @PageNumber INT     = 1,
    @PageSize   INT     = 20
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize   IS NULL OR @PageSize   < 1 SET @PageSize   = 20;
    IF @PageSize > 100 SET @PageSize = 100;

    -- Result set 1: total de registros que cumplen el filtro.
    SELECT COUNT_BIG(1) AS TotalCount
    FROM tasks.TaskItem AS t
    WHERE (@StatusId   IS NULL OR t.StatusId   = @StatusId)
      AND (@PriorityId IS NULL OR t.PriorityId = @PriorityId)
    OPTION (RECOMPILE);

    -- Result set 2: la página solicitada.
    SELECT t.Id,
           t.Title,
           t.Description,
           t.StatusId,
           t.PriorityId,
           t.CreatedAt,
           t.UpdatedAt
    FROM tasks.TaskItem AS t
    WHERE (@StatusId   IS NULL OR t.StatusId   = @StatusId)
      AND (@PriorityId IS NULL OR t.PriorityId = @PriorityId)
    ORDER BY t.PriorityId DESC, t.CreatedAt DESC, t.Id DESC
    OFFSET (CAST(@PageNumber AS BIGINT) - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY
    OPTION (RECOMPILE);
END
GO

/* -----------------------------------------------------------------------------
   tasks.usp_TaskItem_GetById
   Devuelve el detalle de una tarea o ninguna fila si no existe.
----------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE tasks.usp_TaskItem_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT t.Id,
           t.Title,
           t.Description,
           t.StatusId,
           t.PriorityId,
           t.CreatedAt,
           t.UpdatedAt
    FROM tasks.TaskItem AS t
    WHERE t.Id = @Id;
END
GO

/* -----------------------------------------------------------------------------
   Seguridad (principio de mínimo privilegio).
   Rol de aplicación que SOLO puede ejecutar los SPs del schema "tasks":
   no tiene SELECT directo sobre tablas. Asigna tu login de la API a este rol:
       CREATE USER task_api FOR LOGIN task_api;
       ALTER ROLE task_api_executor ADD MEMBER task_api;
----------------------------------------------------------------------------- */
IF DATABASE_PRINCIPAL_ID(N'task_api_executor') IS NULL
    CREATE ROLE task_api_executor AUTHORIZATION dbo;
GO
GRANT EXECUTE ON SCHEMA::tasks TO task_api_executor;
GO
