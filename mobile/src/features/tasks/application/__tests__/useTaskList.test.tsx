import { act, renderHook, waitFor } from '@testing-library/react-native';
import React, { type PropsWithChildren } from 'react';
import {
  FakeTaskRepository,
  makeTask,
} from '../../../../../test/support/FakeTaskRepository';
import { ApiError } from '../../../../core/http/ApiError';
import type { Page, TaskFilters, TaskSummary } from '../../domain/Task';
import type { TaskRepository } from '../../domain/TaskRepository';
import { TaskRepositoryProvider } from '../TaskRepositoryContext';
import { useTaskList } from '../useTaskList';

const wrapperFor =
  (repository: TaskRepository) =>
  ({ children }: PropsWithChildren) =>
    (
      <TaskRepositoryProvider repository={repository}>
        {children}
      </TaskRepositoryProvider>
    );

const tasks = Array.from({ length: 5 }, (_, i) =>
  makeTask({
    id: i + 1,
    title: `T${i + 1}`,
    status: i % 2 === 0 ? 'Pending' : 'Completed',
  }),
);

describe('useTaskList', () => {
  it('carga la primera página y expone el total', async () => {
    const repo = new FakeTaskRepository(tasks);
    const { result } = await renderHook(() => useTaskList({}, 2), {
      wrapper: wrapperFor(repo),
    });

    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.items.map(t => t.id)).toEqual([1, 2]);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('agrega páginas con loadMore hasta agotar resultados', async () => {
    const repo = new FakeTaskRepository(tasks);
    const { result } = await renderHook(() => useTaskList({}, 2), {
      wrapper: wrapperFor(repo),
    });
    await waitFor(() => expect(result.current.status).toBe('idle'));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(4));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(5));

    expect(result.current.hasNextPage).toBe(false);
    expect(repo.calls.map(c => c.page)).toEqual([1, 2, 3]);
  });

  it('recarga desde la página 1 al cambiar el filtro', async () => {
    const repo = new FakeTaskRepository(tasks);
    const { result, rerender } = await renderHook(
      (filters: TaskFilters) => useTaskList(filters, 10),
      {
        wrapper: wrapperFor(repo),
        initialProps: {},
      },
    );
    await waitFor(() => expect(result.current.items).toHaveLength(5));

    await rerender({ status: 'Completed' });

    await waitFor(() =>
      expect(result.current.items.map(t => t.id)).toEqual([2, 4]),
    );
    expect(repo.calls.at(-1)).toMatchObject({
      filters: { status: 'Completed' },
      page: 1,
    });
  });

  it('descarta respuestas obsoletas si el filtro cambia mientras la petición vuela', async () => {
    let resolveSlow: (page: Page<TaskSummary>) => void = () => {};
    const repo: TaskRepository = {
      list: jest.fn((filters: TaskFilters) =>
        filters.status === 'Pending'
          ? new Promise<Page<TaskSummary>>(resolve => {
              resolveSlow = resolve;
            })
          : Promise.resolve({
              items: [tasks[1]],
              pageNumber: 1,
              totalCount: 1,
              hasNextPage: false,
            }),
      ),
      getById: jest.fn(),
    };
    const { result, rerender } = await renderHook(
      (filters: TaskFilters) => useTaskList(filters, 10),
      {
        wrapper: wrapperFor(repo),
        initialProps: { status: 'Pending' } as TaskFilters,
      },
    );

    await rerender({ status: 'Completed' });
    await waitFor(() =>
      expect(result.current.items.map(t => t.id)).toEqual([2]),
    );

    // Llega tarde la respuesta del filtro anterior: no debe pisar el resultado actual.
    await act(async () =>
      resolveSlow({
        items: tasks,
        pageNumber: 1,
        totalCount: 5,
        hasNextPage: false,
      }),
    );
    expect(result.current.items.map(t => t.id)).toEqual([2]);
  });

  it('expone el error y permite reintentar', async () => {
    const repo = new FakeTaskRepository(tasks);
    repo.failNext = new ApiError('network', 'sin red');
    const { result } = await renderHook(() => useTaskList({}, 10), {
      wrapper: wrapperFor(repo),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBeInstanceOf(ApiError);

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('idle'));
    expect(result.current.items).toHaveLength(5);
  });

  it('un fallo al cargar más conserva lo ya cargado', async () => {
    const repo = new FakeTaskRepository(tasks);
    const { result } = await renderHook(() => useTaskList({}, 2), {
      wrapper: wrapperFor(repo),
    });
    await waitFor(() => expect(result.current.status).toBe('idle'));

    repo.failNext = new ApiError('server', 'boom', 500);
    await act(async () => result.current.loadMore());

    await waitFor(() =>
      expect(result.current.loadMoreError).toBeInstanceOf(ApiError),
    );
    expect(result.current.items).toHaveLength(2);
    expect(result.current.status).toBe('idle');
  });
});
