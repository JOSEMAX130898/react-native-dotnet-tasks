import React, { useMemo, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { env } from '../../config/env';
import { createHttpClient } from '../../core/http/HttpClient';
import { TaskRepositoryProvider } from '../../features/tasks/application/TaskRepositoryContext';
import { TaskApiRepository } from '../../features/tasks/data/TaskApiRepository';
import type { TaskRepository } from '../../features/tasks/domain/TaskRepository';

/**
 * Composition root de la app: el único lugar que elige implementaciones concretas.
 * `repository` es opcional para poder inyectar un fake (pruebas, Storybook, demo offline).
 */
export const AppProviders = ({
  children,
  repository,
}: PropsWithChildren<{ repository?: TaskRepository }>) => {
  const taskRepository = useMemo(
    () =>
      repository ??
      new TaskApiRepository(
        createHttpClient(env.apiBaseUrl, env.requestTimeoutMs),
      ),
    [repository],
  );

  return (
    <SafeAreaProvider>
      <TaskRepositoryProvider repository={taskRepository}>
        {children}
      </TaskRepositoryProvider>
    </SafeAreaProvider>
  );
};
