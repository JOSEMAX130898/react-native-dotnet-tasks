import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskFilters } from '../../features/tasks/domain/Task';

/**
 * Rutas tipadas: un parámetro mal escrito es un error de compilación.
 * Los filtros viajan como params de TaskList para que el estado sea navegable
 * (el botón "atrás" y un futuro deep link funcionan sin estado global).
 */
export type RootStackParamList = {
  TaskList: { filters?: TaskFilters } | undefined;
  TaskFilters: { filters: TaskFilters };
  TaskDetail: { id: number; title?: string };
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
