import { ApiError } from '../../../../core/http/ApiError';
import type { TaskDetailDto } from '../dto';
import { toPage, toTaskDetail, toTaskSummary } from '../mappers';

const dto: TaskDetailDto = {
  id: 3,
  title: 'Revisar PR',
  description: '  ',
  priority: 'High',
  status: 'InProgress',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: null,
};

describe('mappers', () => {
  it('mapea el DTO al dominio convirtiendo fechas UTC', () => {
    const task = toTaskSummary(dto);
    expect(task.createdAt.toISOString()).toBe('2026-03-01T10:00:00.000Z');
    expect(task.updatedAt).toBeNull();
    expect(task.status).toBe('InProgress');
  });

  it('normaliza descripciones en blanco a null', () => {
    expect(toTaskDetail(dto).description).toBeNull();
    expect(toTaskDetail({ ...dto, description: 'Hola' }).description).toBe(
      'Hola',
    );
  });

  it.each([
    [{ status: 'Archived' }, /estado desconocido/],
    [{ priority: 'Urgent' }, /prioridad desconocida/],
    [{ createdAt: 'no-es-fecha' }, /createdAt inválida/],
  ])('rechaza datos fuera de contrato %p', (patch, message) => {
    expect(() => toTaskSummary({ ...dto, ...patch })).toThrow(ApiError);
    expect(() => toTaskSummary({ ...dto, ...patch })).toThrow(message);
  });

  it('conserva la metadata de paginación', () => {
    const page = toPage(
      {
        items: [dto],
        pageNumber: 2,
        pageSize: 1,
        totalCount: 5,
        totalPages: 5,
        hasNextPage: true,
      },
      toTaskSummary,
    );
    expect(page).toMatchObject({
      pageNumber: 2,
      totalCount: 5,
      hasNextPage: true,
    });
    expect(page.items).toHaveLength(1);
  });
});
