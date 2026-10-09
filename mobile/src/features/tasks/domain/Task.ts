/**
 * Modelo de dominio del front. Es independiente del contrato HTTP (ver data/dto.ts):
 * si la API cambia un nombre, solo se toca el mapper.
 */
export const TASK_STATUSES = ['Pending', 'InProgress', 'Completed'] as const;
export const TASK_PRIORITIES = ['High', 'Medium', 'Low'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskSummary {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TaskDetail extends TaskSummary {
  description: string | null;
}

/** Filtros de búsqueda. `undefined` = sin filtro. */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface Page<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  hasNextPage: boolean;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  High: 'Alta',
  Medium: 'Media',
  Low: 'Baja',
};

export const countActiveFilters = (filters: TaskFilters): number =>
  (filters.status ? 1 : 0) + (filters.priority ? 1 : 0);
