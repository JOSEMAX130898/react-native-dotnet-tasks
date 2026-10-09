import { useCallback, useEffect, useState } from 'react';
import { isAbortError } from '../../../core/http/HttpClient';
import type { TaskDetail } from '../domain/Task';
import { useTaskRepository } from './TaskRepositoryContext';

export type DetailState =
  | { status: 'loading' }
  | { status: 'success'; task: TaskDetail }
  | { status: 'error'; error: unknown };

/** Caso de uso "ver detalle": carga la tarea y aborta la petición al salir de la pantalla. */
export const useTaskDetail = (id: number) => {
  const repository = useTaskRepository();
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    repository
      .getById(id, controller.signal)
      .then(task => setState({ status: 'success', task }))
      .catch(error => {
        if (!isAbortError(error) && !controller.signal.aborted) {
          setState({ status: 'error', error });
        }
      });
    return () => controller.abort();
  }, [repository, id, attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);

  return { state, retry };
};
