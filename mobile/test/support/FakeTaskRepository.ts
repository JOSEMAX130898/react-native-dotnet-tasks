import { ApiError } from '../../src/core/http/ApiError';
import type {
  Page,
  TaskDetail,
  TaskFilters,
  TaskSummary,
} from '../../src/features/tasks/domain/Task';
import type { TaskRepository } from '../../src/features/tasks/domain/TaskRepository';

export const makeTask = (overrides: Partial<TaskDetail> = {}): TaskDetail => ({
  id: 1,
  title: 'Tarea de prueba',
  description: 'Descripción',
  status: 'Pending',
  priority: 'Medium',
  createdAt: new Date('2026-01-10T12:00:00Z'),
  updatedAt: null,
  ...overrides,
});

/** Fake en memoria que replica filtros y paginación del backend; registra las llamadas. */
export class FakeTaskRepository implements TaskRepository {
  calls: { filters: TaskFilters; page: number; pageSize: number }[] = [];
  failNext: Error | null = null;

  constructor(private readonly tasks: TaskDetail[] = []) {}

  async list(
    filters: TaskFilters,
    page: number,
    pageSize: number,
  ): Promise<Page<TaskSummary>> {
    this.calls.push({ filters, page, pageSize });
    if (this.failNext) {
      const error = this.failNext;
      this.failNext = null;
      throw error;
    }
    const filtered = this.tasks.filter(
      t =>
        (!filters.status || t.status === filters.status) &&
        (!filters.priority || t.priority === filters.priority),
    );
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      pageNumber: page,
      totalCount: filtered.length,
      hasNextPage: start + pageSize < filtered.length,
    };
  }

  async getById(id: number): Promise<TaskDetail> {
    if (this.failNext) {
      const error = this.failNext;
      this.failNext = null;
      throw error;
    }
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new ApiError('notFound', 'no existe', 404);
    }
    return task;
  }
}
