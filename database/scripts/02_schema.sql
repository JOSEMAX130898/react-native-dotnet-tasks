/* =============================================================================
   02_schema.sql
   Esquema relacional. Idempotente (se puede ejecutar varias veces).

   Decisiones:
   - Schema propio "tasks": agrupa objetos del bounded context y permite
     otorgar permisos por schema (el usuario de la app solo ejecuta SPs).
   - Estado y prioridad son tablas catálogo (FK) y no strings libres:
     integridad referencial + índices compactos (TINYINT) + permite ordenar
     por prioridad de forma natural (Low=1 < Medium=2 < High=3).
   - Los Id de los catálogos coinciden con los valores de los enums del
     dominio .NET (contrato explícito, documentado en docs/ARCHITECTURE.md).
   - Fechas en UTC (DATETIME2 + SYSUTCDATETIME): la app las convierte a la
     zona del dispositivo.
============================================================================= */
USE TaskManagerDb;
GO

IF SCHEMA_ID(N'tasks') IS NULL
    EXEC (N'CREATE SCHEMA tasks AUTHORIZATION dbo;');
GO

/* ---------- Catálogo de estados ---------- */
IF OBJECT_ID(N'tasks.TaskStatus', N'U') IS NULL
BEGIN
    CREATE TABLE tasks.TaskStatus
    (
        Id    TINYINT       NOT NULL CONSTRAINT PK_TaskStatus PRIMARY KEY,
        Code  VARCHAR(30)   NOT NULL CONSTRAINT UQ_TaskStatus_Code UNIQUE,
        Name  NVARCHAR(50)  NOT NULL
    );
END
GO

/* ---------- Catálogo de prioridades ---------- */
IF OBJECT_ID(N'tasks.TaskPriority', N'U') IS NULL
BEGIN
    CREATE TABLE tasks.TaskPriority
    (
        Id    TINYINT       NOT NULL CONSTRAINT PK_TaskPriority PRIMARY KEY,
        Code  VARCHAR(30)   NOT NULL CONSTRAINT UQ_TaskPriority_Code UNIQUE,
        Name  NVARCHAR(50)  NOT NULL
    );
END
GO

/* ---------- Tareas ---------- */
IF OBJECT_ID(N'tasks.TaskItem', N'U') IS NULL
BEGIN
    CREATE TABLE tasks.TaskItem
    (
        Id          INT             IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskItem PRIMARY KEY,
        Title       NVARCHAR(150)   NOT NULL,
        Description NVARCHAR(2000)  NULL,
        StatusId    TINYINT         NOT NULL,
        PriorityId  TINYINT         NOT NULL,
        CreatedAt   DATETIME2(0)    NOT NULL CONSTRAINT DF_TaskItem_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt   DATETIME2(0)    NULL,

        CONSTRAINT FK_TaskItem_TaskStatus   FOREIGN KEY (StatusId)   REFERENCES tasks.TaskStatus (Id),
        CONSTRAINT FK_TaskItem_TaskPriority FOREIGN KEY (PriorityId) REFERENCES tasks.TaskPriority (Id),
        CONSTRAINT CK_TaskItem_Title_NotBlank CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_TaskItem_UpdatedAt      CHECK (UpdatedAt IS NULL OR UpdatedAt >= CreatedAt)
    );
END
GO

/* ---------- Índices para los patrones de lectura reales ----------
   La búsqueda ordena por prioridad DESC, fecha DESC y filtra por estado y/o
   prioridad. Los INCLUDE evitan key lookups al listar (covering index). */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TaskItem_Status_Priority_CreatedAt' AND object_id = OBJECT_ID(N'tasks.TaskItem'))
    CREATE NONCLUSTERED INDEX IX_TaskItem_Status_Priority_CreatedAt
        ON tasks.TaskItem (StatusId, PriorityId DESC, CreatedAt DESC)
        INCLUDE (Title, UpdatedAt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TaskItem_Priority_CreatedAt' AND object_id = OBJECT_ID(N'tasks.TaskItem'))
    CREATE NONCLUSTERED INDEX IX_TaskItem_Priority_CreatedAt
        ON tasks.TaskItem (PriorityId DESC, CreatedAt DESC)
        INCLUDE (Title, StatusId, UpdatedAt);
GO
