import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import type { TaskRepository } from '../domain/TaskRepository';

/**
 * Inyección de dependencias con Context: la composición (qué implementación usar)
 * se decide una sola vez en AppProviders; las pruebas pasan un fake.
 */
const TaskRepositoryContext = createContext<TaskRepository | null>(null);

export const TaskRepositoryProvider = ({
  repository,
  children,
}: PropsWithChildren<{ repository: TaskRepository }>) => (
  <TaskRepositoryContext.Provider value={repository}>
    {children}
  </TaskRepositoryContext.Provider>
);

export const useTaskRepository = (): TaskRepository => {
  const repository = useContext(TaskRepositoryContext);
  if (!repository) {
    throw new Error(
      'useTaskRepository debe usarse dentro de <TaskRepositoryProvider>.',
    );
  }
  return repository;
};
