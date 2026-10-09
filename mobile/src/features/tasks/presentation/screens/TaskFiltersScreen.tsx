import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ScreenProps } from '../../../../app/navigation/types';
import { Button } from '../../../../shared/ui/Button';
import { Chip } from '../../../../shared/ui/Chip';
import { spacing, typography, useTheme } from '../../../../shared/ui/theme';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskFilters,
} from '../../domain/Task';

interface OptionGroupProps<T extends string> {
  title: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

/** Grupo de selección única con opción "Todos" (= sin filtro). */
const OptionGroup = <T extends string>({
  title,
  options,
  labels,
  value,
  onChange,
}: OptionGroupProps<T>) => {
  const { colors } = useTheme();
  return (
    <View
      style={styles.group}
      accessibilityRole="radiogroup"
      accessibilityLabel={title}
    >
      <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.chips}>
        <Chip
          label="Todos"
          selected={value === undefined}
          onPress={() => onChange(undefined)}
        />
        {options.map(option => (
          <Chip
            key={option}
            label={labels[option]}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * Pantalla de filtrado. Trabaja sobre un borrador local y solo aplica al confirmar:
 * explorar opciones no dispara una petición por cada toque.
 */
export const TaskFiltersScreen = ({
  navigation,
  route,
}: ScreenProps<'TaskFilters'>) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TaskFilters>(route.params.filters);

  const apply = (filters: TaskFilters) =>
    navigation.popTo('TaskList', { filters }, { merge: true });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <OptionGroup
          title="Estado"
          options={TASK_STATUSES}
          labels={STATUS_LABELS}
          value={draft.status}
          onChange={status => setDraft(d => ({ ...d, status }))}
        />
        <OptionGroup
          title="Prioridad"
          options={TASK_PRIORITIES}
          labels={PRIORITY_LABELS}
          value={draft.priority}
          onChange={priority => setDraft(d => ({ ...d, priority }))}
        />
      </ScrollView>
      <View
        style={[
          styles.actions,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            paddingBottom: spacing.lg + insets.bottom,
          },
        ]}
      >
        <View style={styles.action}>
          <Button
            label="Limpiar"
            variant="secondary"
            onPress={() => apply({})}
          />
        </View>
        <View style={styles.action}>
          <Button label="Aplicar" onPress={() => apply(draft)} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  group: { gap: spacing.md },
  groupTitle: { ...typography.subtitle },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: { flex: 1 },
});
