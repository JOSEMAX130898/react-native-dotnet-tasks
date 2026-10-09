import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../../../core/http/HttpClient';
import type { TaskFilters, TaskSummary } from '../domain/Task';
import { useTaskRepository } from './TaskRepositoryContext';

export type ListStatus =
  | 'loading'
  | 'refreshing'
  | 'loadingMore'
  | 'idle'
  | 'error';

export interface TaskListState {
  items: TaskSummary[];
  totalCount: number;
  status: ListStatus;
  error: unknown;
  /** Error al cargar la siguiente página: se muestra al pie sin perder lo ya cargado. */
  loadMoreError: unknown;
  hasNextPage: boolean;
  refresh: () => void;
  loadMore: () => void;
  retry: () => void;
}

/**
 * Caso de uso "listar tareas" en la app: paginación incremental, pull-to-refresh y
 * reintento. Puntos delicados que resuelve:
 *  - Carreras: cada carga lleva un id; si el usuario cambia de filtro mientras una
 *    petición vuela, la respuesta vieja se descarta (y además se aborta la petición).
 *  - Doble disparo de onEndReached: se ignora si ya hay una carga en curso.
 *  - Desmontaje: se aborta lo pendiente para no actualizar estado de un componente muerto.
 */
export const useTaskList = (
  filters: TaskFilters,
  pageSize: number,
): TaskListState => {
  const repository = useTaskRepository();
  const [items, setItems] = useState<TaskSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [error, setError] = useState<unknown>(null);
  const [loadMoreError, setLoadMoreError] = useState<unknown>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const pageRef = useRef(0);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  const { status: statusFilter, priority: priorityFilter } = filters;

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'more') => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;
      const nextPage = mode === 'more' ? pageRef.current + 1 : 1;

      busyRef.current = true;
      setStatus(
        mode === 'initial'
          ? 'loading'
          : mode === 'refresh'
          ? 'refreshing'
          : 'loadingMore',
      );
      if (mode === 'more') {
        setLoadMoreError(null);
      } else {
        setError(null);
      }

      try {
        const page = await repository.list(
          { status: statusFilter, priority: priorityFilter },
          nextPage,
          pageSize,
          controller.signal,
        );
        if (requestId !== requestIdRef.current) {
          return; // Respuesta obsoleta.
        }
        pageRef.current = nextPage;
        setItems(prev => {
          if (mode !== 'more') {
            return page.items;
          }
          // Evita duplicados si los datos cambiaron entre páginas (offset pagination).
          const seen = new Set(prev.map(t => t.id));
          return [...prev, ...page.items.filter(t => !seen.has(t.id))];
        });
        setTotalCount(page.totalCount);
        setHasNextPage(page.hasNextPage);
        setStatus('idle');
      } catch (e) {
        if (isAbortError(e) || requestId !== requestIdRef.current) {
          return;
        }
        if (mode === 'more') {
          setLoadMoreError(e);
          setStatus('idle');
        } else {
          setError(e);
          setStatus('error');
        }
      } finally {
        if (requestId === requestIdRef.current) {
          busyRef.current = false;
        }
      }
    },
    [repository, statusFilter, priorityFilter, pageSize],
  );

  useEffect(() => {
    pageRef.current = 0;
    setItems([]);
    setHasNextPage(false);
    load('initial');
    return () => abortRef.current?.abort();
  }, [load]);

  const refresh = useCallback(() => {
    load('refresh');
  }, [load]);

  const retry = useCallback(() => {
    load('initial');
  }, [load]);

  /** Pide la siguiente página. También sirve como "reintentar" desde el pie de la lista. */
  const loadMore = useCallback(() => {
    if (busyRef.current || !hasNextPage) {
      return;
    }
    load('more');
  }, [hasNextPage, load]);

  return {
    items,
    totalCount,
    status,
    error,
    loadMoreError,
    hasNextPage,
    refresh,
    loadMore,
    retry,
  };
};
