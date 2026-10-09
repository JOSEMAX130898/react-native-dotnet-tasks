import { ApiError } from '../../../core/http/ApiError';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Page,
  type TaskDetail,
  type TaskPriority,
  type TaskStatus,
  type TaskSummary,
} from '../domain/Task';
import type { PagedResultDto, TaskDetailDto, TaskSummaryDto } from './dto';

const isStatus = (value: string): value is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(value);

const isPriority = (value: string): value is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(value);

const contractError = (detail: string) =>
  new ApiError(
    'unknown',
    `Respuesta del servidor con formato inesperado: ${detail}`,
  );

const toDate = (value: string, field: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw contractError(`${field} inválida (${value})`);
  }
  return date;
};

/**
 * DTO -> dominio. Valida en el borde: si el backend envía un estado nuevo que la app
 * aún no conoce, se detecta aquí con un error claro y no como un crash en un componente.
 */
export const toTaskSummary = (dto: TaskSummaryDto): TaskSummary => {
  if (!isStatus(dto.status)) {
    throw contractError(`estado desconocido "${dto.status}"`);
  }
  if (!isPriority(dto.priority)) {
    throw contractError(`prioridad desconocida "${dto.priority}"`);
  }
  return {
    id: dto.id,
    title: dto.title,
    status: dto.status,
    priority: dto.priority,
    createdAt: toDate(dto.createdAt, 'createdAt'),
    updatedAt: dto.updatedAt ? toDate(dto.updatedAt, 'updatedAt') : null,
  };
};

export const toTaskDetail = (dto: TaskDetailDto): TaskDetail => ({
  ...toTaskSummary(dto),
  description: dto.description?.trim() ? dto.description : null,
});

export const toPage = <TDto, T>(
  dto: PagedResultDto<TDto>,
  map: (item: TDto) => T,
): Page<T> => ({
  items: dto.items.map(map),
  pageNumber: dto.pageNumber,
  totalCount: dto.totalCount,
  hasNextPage: dto.hasNextPage,
});
