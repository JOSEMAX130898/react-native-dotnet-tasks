import type { ScreenProps } from '../../../../app/navigation/types';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
  FakeTaskRepository,
  makeTask,
} from '../../../../../test/support/FakeTaskRepository';
import {
  createNavigation,
  renderWithProviders,
} from '../../../../../test/support/renderWithProviders';
import { ApiError } from '../../../../core/http/ApiError';
import { TaskListScreen } from '../screens/TaskListScreen';

const tasks = [
  makeTask({
    id: 1,
    title: 'Pagar la luz',
    priority: 'High',
    status: 'Pending',
  }),
  makeTask({
    id: 2,
    title: 'Leer libro',
    priority: 'Low',
    status: 'Completed',
  }),
];

const renderScreen = async (repo: FakeTaskRepository, params?: object) => {
  const navigation = createNavigation();
  const props = {
    navigation,
    route: { key: 'TaskList', name: 'TaskList', params },
  } as unknown as ScreenProps<'TaskList'>;
  return {
    navigation,
    view: await renderWithProviders(<TaskListScreen {...props} />, repo),
  };
};

describe('TaskListScreen', () => {
  it('muestra las tareas y navega al detalle al tocar una', async () => {
    const { navigation } = await renderScreen(new FakeTaskRepository(tasks));

    expect(await screen.findByText('Pagar la luz')).toBeTruthy();
    expect(screen.getByText('2 tareas')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('task-card-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('TaskDetail', {
      id: 1,
      title: 'Pagar la luz',
    });
  });

  it('muestra los filtros activos y permite quitarlos', async () => {
    const { navigation } = await renderScreen(new FakeTaskRepository(tasks), {
      filters: { status: 'Completed' },
    });

    expect(await screen.findByText('Leer libro')).toBeTruthy();
    expect(screen.queryByText('Pagar la luz')).toBeNull();

    await fireEvent.press(
      screen.getByLabelText('Quitar filtro de estado Completada'),
    );
    expect(navigation.setParams).toHaveBeenCalledWith({
      filters: { status: undefined },
    });
  });

  it('estado vacío con filtros ofrece limpiarlos', async () => {
    const { navigation } = await renderScreen(new FakeTaskRepository(tasks), {
      filters: { status: 'InProgress' },
    });

    expect(await screen.findByText('Sin resultados')).toBeTruthy();
    await fireEvent.press(screen.getByText('Limpiar filtros'));
    expect(navigation.setParams).toHaveBeenCalledWith({ filters: {} });
  });

  it('estado de error con reintento', async () => {
    const repo = new FakeTaskRepository(tasks);
    repo.failNext = new ApiError('network', 'x');
    await renderScreen(repo);

    expect(
      await screen.findByText('No se pudieron cargar las tareas'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Reintentar'));
    await waitFor(() => expect(screen.getByText('Pagar la luz')).toBeTruthy());
  });
});
