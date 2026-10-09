import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  radius,
  spacing,
  typography,
  useTheme,
} from '../../../../shared/ui/theme';
import { formatRelative } from '../../../../shared/utils/formatDate';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskSummary,
} from '../../domain/Task';
import { PriorityBadge, StatusBadge } from './TaskBadges';

interface TaskCardProps {
  task: TaskSummary;
  onPress: (task: TaskSummary) => void;
}

/** Tarjeta de la lista. `memo`: con scroll infinito evita re-render de filas que no cambian. */
export const TaskCard = memo(({ task, onPress }: TaskCardProps) => {
  const { colors } = useTheme();
  const completed = task.status === 'Completed';
  const accent = {
    High: colors.high.fg,
    Medium: colors.medium.fg,
    Low: colors.low.fg,
  }[task.priority];

  return (
    <Pressable
      onPress={() => onPress(task)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}. ${
        STATUS_LABELS[task.status]
      }. Prioridad ${PRIORITY_LABELS[task.priority]}.`}
      accessibilityHint="Abre el detalle de la tarea"
      testID={`task-card-${task.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            { color: completed ? colors.textMuted : colors.text },
            completed && styles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        <View style={styles.row}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          Creada {formatRelative(task.createdAt)}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
    </Pressable>
  );
});

TaskCard.displayName = 'TaskCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accent: { width: 4, alignSelf: 'stretch' },
  content: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.subtitle, fontSize: 16 },
  completedTitle: { textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  meta: { ...typography.caption, fontWeight: '400' },
  chevron: { fontSize: 26, paddingRight: spacing.lg },
});
