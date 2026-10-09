import { render } from '@testing-library/react-native';
import React, { type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskRepositoryProvider } from '../../src/features/tasks/application/TaskRepositoryContext';
import type { TaskRepository } from '../../src/features/tasks/domain/TaskRepository';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export const renderWithProviders = (
  ui: ReactElement,
  repository: TaskRepository,
) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TaskRepositoryProvider repository={repository}>
        {ui}
      </TaskRepositoryProvider>
    </SafeAreaProvider>,
  );

/** Navegación falsa: las pantallas solo usan estos métodos. */
export const createNavigation = () => ({
  navigate: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  popTo: jest.fn(),
  goBack: jest.fn(),
});
