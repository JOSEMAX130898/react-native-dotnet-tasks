import type { ScreenProps } from '../../../../app/navigation/types';
import { screen } from '@testing-library/react-native';
import React from 'react';
import {
  FakeTaskRepository,
  makeTask,
} from '../../../../../test/support/FakeTaskRepository';
import {
  createNavigation,
  renderWithProviders,
} from '../../../../../test/support/renderWithProviders';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';

const renderScreen = async (repo: FakeTaskRepository, id: number) => {
  const props = {
    navigation: createNavigation(),
    route: { key: 'd', name: 'TaskDetail', params: { id } },
  } as unknown as ScreenProps<'TaskDetail'>;
  return await renderWithProviders(<TaskDetailScreen {...props} />, repo);
};

describe('TaskDetailScreen', () => {
  it('muestra título, descripción, estado y prioridad', async () => {
    await renderScreen(
      new FakeTaskRepository([
        makeTask({
          id: 7,
          title: 'Revisar PR',
          description: 'Validar tokens',
          status: 'InProgress',
          priority: 'High',
        }),
      ]),
      7,
    );

    expect(await screen.findByText('Revisar PR')).toBeTruthy();
    expect(screen.getByText('Validar tokens')).toBeTruthy();
    expect(screen.getByText('En progreso')).toBeTruthy();
    expect(screen.getByText('Prioridad alta')).toBeTruthy();
    expect(screen.getByText('Sin cambios')).toBeTruthy();
  });

  it('indica cuando la tarea no tiene descripción', async () => {
    await renderScreen(
      new FakeTaskRepository([makeTask({ id: 1, description: null })]),
      1,
    );

    expect(
      await screen.findByText('Esta tarea no tiene descripción.'),
    ).toBeTruthy();
  });

  it('muestra "no encontrada" si la API responde 404', async () => {
    await renderScreen(new FakeTaskRepository([]), 99);

    expect(await screen.findByText('Tarea no encontrada')).toBeTruthy();
    expect(screen.getByText('Volver')).toBeTruthy();
  });
});
