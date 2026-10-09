import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TaskDetailScreen } from '../../features/tasks/presentation/screens/TaskDetailScreen';
import { TaskFiltersScreen } from '../../features/tasks/presentation/screens/TaskFiltersScreen';
import { TaskListScreen } from '../../features/tasks/presentation/screens/TaskListScreen';
import { useTheme } from '../../shared/ui/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ title: 'Mis tareas' }}
      />
      <Stack.Screen
        name="TaskFilters"
        component={TaskFiltersScreen}
        options={{ title: 'Filtrar tareas', presentation: 'modal' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalle', headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack.Navigator>
  );
};
