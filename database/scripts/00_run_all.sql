/* =============================================================================
   00_run_all.sql
   Ejecuta todos los scripts en orden. Requiere MODO SQLCMD:
     - SSMS:        menú Query > SQLCMD Mode, abrir este archivo desde database/scripts y ejecutar (F5).
     - Azure Data Studio / VS Code (mssql): habilitar SQLCMD.
     - Consola:     sqlcmd -S localhost -U sa -P <password> -C -i 00_run_all.sql
   Todos los scripts son idempotentes: se pueden volver a ejecutar sin duplicar datos.
============================================================================= */
:on error exit
:r ./01_create_database.sql
:r ./02_schema.sql
:r ./03_stored_procedures.sql
:r ./04_seed_data.sql
