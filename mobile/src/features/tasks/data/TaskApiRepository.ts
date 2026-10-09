import type { HttpClient } from '../../../core/http/HttpClient';
import type {
  Page,
  TaskDetail,
  TaskFilters,
  TaskSummary,
} from '../domain/Task';
import type { TaskRepository } from '../domain/TaskRepository';
import type { PagedResultDto, TaskDetailDto, TaskSummaryDto } from './dto';
import { toPage, toTaskDetail, toTaskSummary } from './mappers';

/** Adaptador del puerto {@link TaskRepository} contra la API REST. */
export class TaskApiRepository implements TaskRepository {
  constructor(private readonly http: HttpClient) {}

  async list(
    filters: TaskFilters,
    page: number,
    pageSize: number,
    signal?: AbortSignal,
  ): Promise<Page<TaskSummary>> {
    const dto = await this.http.get<PagedResultDto<TaskSummaryDto>>('/tasks', {
      params: {
        status: filters.status,
        priority: filters.priority,
        page,
        pageSize,
      },
      signal,
    });
    return toPage(dto, toTaskSummary);
  }

  async getById(id: number, signal?: AbortSignal): Promise<TaskDetail> {
    const dto = await this.http.get<TaskDetailDto>(
      `/tasks/${encodeURIComponent(String(id))}`,
      { signal },
    );
    return toTaskDetail(dto);
  }
}
