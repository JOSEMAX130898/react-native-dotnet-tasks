import type { Page, TaskDetail, TaskFilters, TaskSummary } from './Task';

/**
 * Puerto de datos de la feature (misma idea que en el backend). Los hooks y pantallas
 * dependen de esta interfaz, no de fetch: en las pruebas se inyecta un fake y mañana
 * podría existir una implementación con caché offline sin tocar la UI.
 */
export interface TaskRepository {
  list(
    filters: TaskFilters,
    page: number,
    pageSize: number,
    signal?: AbortSignal,
  ): Promise<Page<TaskSummary>>;

  getById(id: number, signal?: AbortSignal): Promise<TaskDetail>;
}
