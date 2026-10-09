/* =============================================================================
   04_seed_data.sql
   Datos por defecto. Idempotente:
   - Catálogos: MERGE (inserta/actualiza sin duplicar).
   - Tareas: solo se insertan si la tabla está vacía.
   Incluye casos borde a propósito: descripción NULL, descripción larga,
   acentos/emoji (NVARCHAR), título largo, tareas sin UpdatedAt.
============================================================================= */
USE TaskManagerDb;
GO

SET NOCOUNT ON;

/* ---------- Catálogos (Id == valor del enum en el dominio .NET) ---------- */
MERGE tasks.TaskStatus AS target
USING (VALUES
    (CAST(1 AS TINYINT), 'PENDING',     N'Pendiente'),
    (CAST(2 AS TINYINT), 'IN_PROGRESS', N'En progreso'),
    (CAST(3 AS TINYINT), 'COMPLETED',   N'Completada')
) AS source (Id, Code, Name)
ON target.Id = source.Id
WHEN MATCHED AND (target.Code <> source.Code OR target.Name <> source.Name)
    THEN UPDATE SET Code = source.Code, Name = source.Name
WHEN NOT MATCHED BY TARGET
    THEN INSERT (Id, Code, Name) VALUES (source.Id, source.Code, source.Name);
GO

MERGE tasks.TaskPriority AS target
USING (VALUES
    (CAST(1 AS TINYINT), 'LOW',    N'Baja'),
    (CAST(2 AS TINYINT), 'MEDIUM', N'Media'),
    (CAST(3 AS TINYINT), 'HIGH',   N'Alta')
) AS source (Id, Code, Name)
ON target.Id = source.Id
WHEN MATCHED AND (target.Code <> source.Code OR target.Name <> source.Name)
    THEN UPDATE SET Code = source.Code, Name = source.Name
WHEN NOT MATCHED BY TARGET
    THEN INSERT (Id, Code, Name) VALUES (source.Id, source.Code, source.Name);
GO

/* ---------- Tareas de ejemplo ----------
   StatusId:   1=Pendiente, 2=En progreso, 3=Completada
   PriorityId: 1=Baja, 2=Media, 3=Alta
   DaysAgo / UpdatedDaysAgo: fechas relativas a la ejecución del script. */
IF NOT EXISTS (SELECT 1 FROM tasks.TaskItem)
BEGIN
    DECLARE @now DATETIME2(0) = SYSUTCDATETIME();

    INSERT INTO tasks.TaskItem (Title, Description, StatusId, PriorityId, CreatedAt, UpdatedAt)
    SELECT s.Title,
           s.Description,
           s.StatusId,
           s.PriorityId,
           DATEADD(HOUR, -s.HoursAgo, @now),
           CASE WHEN s.UpdatedHoursAgo IS NULL THEN NULL ELSE DATEADD(HOUR, -s.UpdatedHoursAgo, @now) END
    FROM (VALUES
        (N'Preparar presentación del sprint',          N'Armar las diapositivas con el avance del sprint 14: métricas de velocidad, bugs cerrados y riesgos abiertos.', 1, 3,   2, NULL),
        (N'Pagar el recibo de luz',                    N'Vence el viernes. Se puede pagar desde la app del banco.',                                                       1, 3,   5, NULL),
        (N'Revisar PR de autenticación',               N'Validar manejo de refresh tokens y expiración. Dejar comentarios antes del daily.',                               2, 3,  10,    1),
        (N'Renovar DNI',                               N'Sacar cita en la web de RENIEC y llevar foto tamaño pasaporte.',                                                  1, 2,  20, NULL),
        (N'Comprar víveres de la semana',              N'Leche, huevos, pan integral, frutas, café ☕ y arroz.',                                                           1, 1,  26, NULL),
        (N'Configurar backups de la base de datos',    N'Backup completo diario y de log cada 15 minutos. Probar restauración en staging.',                                 2, 3,  30,    3),
        (N'Leer "Clean Architecture"',                 N'Capítulos 17 a 22: límites, componentes y la regla de dependencias.',                                             2, 1,  48,   12),
        (N'Actualizar dependencias del backend',       N'Subir paquetes NuGet con parches de seguridad y correr la suite de pruebas.',                                     1, 2,  50, NULL),
        (N'Llamar al dentista',                        NULL,                                                                                                               1, 2,  55, NULL),
        (N'Escribir pruebas del módulo de pagos',      N'Cubrir casos borde: montos en cero, monedas distintas y reintentos idempotentes.',                                2, 2,  60,    6),
        (N'Organizar el escritorio',                   N'Tirar papeles viejos y ordenar cables.',                                                                          3, 1,  72,   70),
        (N'Enviar informe mensual',                    N'Informe de KPIs de septiembre al equipo de producto.',                                                            3, 3,  80,   75),
        (N'Planificar vacaciones',                     N'Comparar vuelos a Cusco vs. Arequipa para la segunda quincena de diciembre ✈️.',                                  1, 1,  90, NULL),
        (N'Migrar logs a formato estructurado',        N'Reemplazar logs de texto plano por JSON con correlationId para poder consultarlos en el agregador.',              1, 2, 100, NULL),
        (N'Documentar endpoints de la API',            N'Completar descripciones de OpenAPI y ejemplos de respuesta para cada endpoint.',                                  3, 2, 110,   96),
        (N'Revisar alertas de monitoreo',              N'Ajustar umbrales de CPU y latencia p95 que generan falsos positivos.',                                            2, 2, 120,   24),
        (N'Cambiar aceite del auto',                   N'Toca a los 10 000 km. Pedir también revisión de frenos.',                                                         1, 2, 130, NULL),
        (N'Corregir crash al rotar pantalla',          N'La pantalla de detalle pierde el estado al rotar en Android 14. Reproducible en Pixel 7.',                         2, 3, 140,    2),
        (N'Inscribirse al curso de inglés',            N'Nivel intermedio, horario nocturno.',                                                                             3, 1, 150,  140),
        (N'Hacer copia de seguridad de las fotos',     NULL,                                                                                                               3, 1, 160,  158),
        (N'Revisar contrato del proveedor de hosting', N'Validar SLA de disponibilidad (99.9%), penalidades y cláusula de salida antes de la renovación anual.',             1, 3, 170, NULL),
        (N'Preparar retrospectiva',                    N'Usar dinámica "Start / Stop / Continue". Reservar sala.',                                                         3, 2, 180,  168),
        (N'Optimizar consulta de reportes',            N'La consulta de ventas por región tarda 8 s. Revisar plan de ejecución e índices faltantes.',                     1, 3, 190, NULL),
        (N'Regar las plantas',                         N'Las del balcón necesitan agua día por medio.',                                                                    3, 1, 200,  199),
        (N'Actualizar CV',                             N'Agregar el último proyecto y certificaciones.',                                                                   1, 1, 210, NULL),
        (N'Definir estrategia de feature flags',       N'Evaluar opciones (archivo de configuración vs. servicio externo) y documentar la decisión en un ADR.',            2, 2, 220,   48),
        (N'Tarea con título muy largo para validar que la interfaz trunca correctamente el texto sin romper el diseño de la tarjeta',
                                                       N'Caso borde de UI: el título debe mostrarse en máximo dos líneas en la lista y completo en el detalle.',           1, 1, 230, NULL),
        (N'Tarea con descripción extensa',
            N'Este texto existe para validar el comportamiento con descripciones largas. '
          + N'En la lista no se muestra la descripción para reducir el tamaño de la respuesta; '
          + N'en el detalle debe poder leerse completa con scroll. '
          + N'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
          + N'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. '
          + N'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. '
          + N'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                                                                                                                                                                           2, 1, 240,  100),
        (N'Cerrar tickets duplicados',                 N'Unificar los tickets repetidos del tablero de soporte.',                                                          3, 2, 250,  245),
        (N'Revisar presupuesto trimestral',            N'Comparar gasto real vs. planificado en infraestructura cloud.',                                                  1, 2, 260, NULL)
    ) AS s (Title, Description, StatusId, PriorityId, HoursAgo, UpdatedHoursAgo);
END
GO

PRINT N'Seed completado.';
GO
