import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ScreenProps } from '../../../../app/navigation/types';
import { env } from '../../../../config/env';
import { userMessageFor } from '../../../../core/http/ApiError';
import { Chip } from '../../../../shared/ui/Chip';
import { LoadingView, StateView } from '../../../../shared/ui/StateView';
import {
  radius,
  spacing,
  typography,
  useTheme,
} from '../../../../shared/ui/theme';
import { useTaskList } from '../../application/useTaskList';
import {
  countActiveFilters,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskFilters,
  type TaskSummary,
} from '../../domain/Task';
import { TaskCard } from '../components/TaskCard';

const NO_FILTERS: TaskFilters = {};

export const TaskListScreen = ({
  navigation,
  route,
}: ScreenProps<'TaskList'>) => {
  const { colors } = useTheme();
  const filters = route.params?.filters ?? NO_FILTERS;
  // Clave estable: el hook solo recarga si el filtro cambia de verdad, no por identidad del objeto.
  const stableFilters = useMemo<TaskFilters>(
    () => ({ status: filters.status, priority: filters.priority }),
    [filters.status, filters.priority],
  );
  const activeCount = countActiveFilters(stableFilters);
  const list = useTaskList(stableFilters, env.pageSize);

  const openFilters = useCallback(
    () => navigation.navigate('TaskFilters', { filters: stableFilters }),
    [navigation, stableFilters],
  );
  const setFilters = useCallback(
    (next: TaskFilters) => navigation.setParams({ filters: next }),
    [navigation],
  );
  const openDetail = useCallback(
    (task: TaskSummary) =>
      navigation.navigate('TaskDetail', { id: task.id, title: task.title }),
    [navigation],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // API de React Navigation: headerRight recibe una función de render.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <FiltersHeaderButton
          activeCount={activeCount}
          onPress={openFilters}
          color={colors.primary}
        />
      ),
    });
  }, [navigation, openFilters, activeCount, colors.primary]);

  const header = (
    <View style={styles.header}>
      {activeCount > 0 ? (
        <View style={styles.chips}>
          {stableFilters.status ? (
            <Chip
              selected
              removable
              label={STATUS_LABELS[stableFilters.status]}
              accessibilityLabel={`Quitar filtro de estado ${
                STATUS_LABELS[stableFilters.status]
              }`}
              onPress={() =>
                setFilters({ ...stableFilters, status: undefined })
              }
            />
          ) : null}
          {stableFilters.priority ? (
            <Chip
              selected
              removable
              label={`Prioridad ${PRIORITY_LABELS[
                stableFilters.priority
              ].toLowerCase()}`}
              accessibilityLabel={`Quitar filtro de prioridad ${
                PRIORITY_LABELS[stableFilters.priority]
              }`}
              onPress={() =>
                setFilters({ ...stableFilters, priority: undefined })
              }
            />
          ) : null}
        </View>
      ) : null}
      {list.status !== 'loading' && list.status !== 'error' ? (
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {list.totalCount === 1 ? '1 tarea' : `${list.totalCount} tareas`}
        </Text>
      ) : null}
    </View>
  );

  const renderFooter = () => {
    if (list.status === 'loadingMore') {
      return <ActivityIndicator style={styles.footer} color={colors.primary} />;
    }
    if (list.loadMoreError) {
      return (
        <Pressable
          onPress={list.loadMore}
          accessibilityRole="button"
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.danger }]}>
            No se pudieron cargar más tareas. Toca para reintentar.
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const renderBody = () => {
    if (list.status === 'loading') {
      return <LoadingView label="Cargando tareas" />;
    }
    if (list.status === 'error') {
      return (
        <StateView
          icon="⚠️"
          title="No se pudieron cargar las tareas"
          message={userMessageFor(list.error)}
          actionLabel="Reintentar"
          onAction={list.retry}
        />
      );
    }
    if (list.items.length === 0) {
      return activeCount > 0 ? (
        <StateView
          icon="🔍"
          title="Sin resultados"
          message="Ninguna tarea coincide con los filtros seleccionados."
          actionLabel="Limpiar filtros"
          onAction={() => setFilters({})}
        />
      ) : (
        <StateView
          icon="✅"
          title="No tienes tareas"
          message="Cuando tengas tareas aparecerán aquí."
        />
      );
    }
    return null;
  };

  const body = renderBody();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {header}
      {body ?? (
        <FlatList
          data={list.items}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={openDetail} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          onEndReached={list.loadMoreError ? undefined : list.loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter() ?? undefined}
          refreshControl={
            <RefreshControl
              refreshing={list.status === 'refreshing'}
              onRefresh={list.refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          testID="task-list"
        />
      )}
    </View>
  );
};

const Separator = () => <View style={styles.separator} />;

const FiltersHeaderButton = ({
  activeCount,
  onPress,
  color,
}: {
  activeCount: number;
  onPress: () => void;
  color: string;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={
      activeCount > 0 ? `Filtros, ${activeCount} activos` : 'Filtros'
    }
    hitSlop={10}
    testID="open-filters"
  >
    <Text style={[styles.headerButton, { color }]}>
      Filtrar{activeCount > 0 ? ` (${activeCount})` : ''}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  count: { ...typography.caption, fontWeight: '400' },
  headerButton: { ...typography.body, fontWeight: '600' },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  separator: { height: spacing.md },
  footer: {
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  footerText: { ...typography.caption, textAlign: 'center' },
});
