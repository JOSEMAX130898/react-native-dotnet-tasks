import type { ScreenProps } from '../../../../app/navigation/types';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { FakeTaskRepository } from '../../../../../test/support/FakeTaskRepository';
import {
  createNavigation,
  renderWithProviders,
} from '../../../../../test/support/renderWithProviders';
import { TaskFiltersScreen } from '../screens/TaskFiltersScreen';

const renderScreen = async (filters: object) => {
  const navigation = createNavigation();
  const props = {
    navigation,
    route: { key: 'f', name: 'TaskFilters', params: { filters } },
  } as unknown as ScreenProps<'TaskFilters'>;
  await renderWithProviders(
    <TaskFiltersScreen {...props} />,
    new FakeTaskRepository(),
  );
  return navigation;
};

describe('TaskFiltersScreen', () => {
  it('aplica la combinación elegida al volver a la lista', async () => {
    const navigation = await renderScreen({});

    await fireEvent.press(await screen.findByText('En progreso'));
    await fireEvent.press(screen.getByText('Alta'));
    await fireEvent.press(screen.getByText('Aplicar'));

    expect(navigation.popTo).toHaveBeenCalledWith(
      'TaskList',
      { filters: { status: 'InProgress', priority: 'High' } },
      { merge: true },
    );
  });

  it('parte de los filtros actuales y "Limpiar" los quita todos', async () => {
    const navigation = await renderScreen({ status: 'Completed' });

    const completed = await screen.findByText('Completada');
    expect(completed).toBeTruthy();
    await fireEvent.press(screen.getByText('Limpiar'));

    expect(navigation.popTo).toHaveBeenCalledWith(
      'TaskList',
      { filters: {} },
      { merge: true },
    );
  });

  it('"Todos" deselecciona el filtro de ese grupo', async () => {
    const navigation = await renderScreen({
      status: 'Completed',
      priority: 'Low',
    });

    await fireEvent.press((await screen.findAllByText('Todos'))[0]);
    await fireEvent.press(screen.getByText('Aplicar'));

    expect(navigation.popTo).toHaveBeenCalledWith(
      'TaskList',
      { filters: { status: undefined, priority: 'Low' } },
      { merge: true },
    );
  });
});
