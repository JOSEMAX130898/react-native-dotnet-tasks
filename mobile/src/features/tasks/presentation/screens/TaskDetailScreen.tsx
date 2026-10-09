import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScreenProps } from '../../../../app/navigation/types';
import { ApiError, userMessageFor } from '../../../../core/http/ApiError';
import { LoadingView, StateView } from '../../../../shared/ui/StateView';
import {
  radius,
  spacing,
  typography,
  useTheme,
} from '../../../../shared/ui/theme';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { useTaskDetail } from '../../application/useTaskDetail';
import { PriorityBadge, StatusBadge } from '../components/TaskBadges';

export const TaskDetailScreen = ({
  route,
  navigation,
}: ScreenProps<'TaskDetail'>) => {
  const { colors } = useTheme();
  const { state, retry } = useTaskDetail(route.params.id);

  if (state.status === 'loading') {
    return <LoadingView label="Cargando detalle" />;
  }

  if (state.status === 'error') {
    // Un 404 no se "reintenta": la acción útil es volver a la lista.
    const notFound =
      state.error instanceof ApiError && state.error.kind === 'notFound';
    return notFound ? (
      <StateView
        icon="🗂️"
        title="Tarea no encontrada"
        message={userMessageFor(state.error)}
        actionLabel="Volver"
        onAction={navigation.goBack}
      />
    ) : (
      <StateView
        icon="⚠️"
        title="No se pudo cargar la tarea"
        message={userMessageFor(state.error)}
        actionLabel="Reintentar"
        onAction={retry}
      />
    );
  }

  const { task } = state;
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.title, { color: colors.text }]}
          accessibilityRole="header"
          selectable
        >
          {task.title}
        </Text>
        <View style={styles.badges}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Descripción
        </Text>
        {task.description ? (
          <Text style={[styles.body, { color: colors.text }]} selectable>
            {task.description}
          </Text>
        ) : (
          <Text
            style={[styles.body, styles.empty, { color: colors.textMuted }]}
          >
            Esta tarea no tiene descripción.
          </Text>
        )}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <InfoRow label="Creada" value={formatDateTime(task.createdAt)} />
        <InfoRow
          label="Última actualización"
          value={
            task.updatedAt ? formatDateTime(task.updatedAt) : 'Sin cambios'
          }
        />
        <InfoRow label="Identificador" value={`#${task.id}`} />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.title },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: { ...typography.body, lineHeight: 22 },
  empty: { fontStyle: 'italic' },
  infoRow: { gap: 2 },
});
