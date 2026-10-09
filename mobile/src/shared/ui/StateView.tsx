import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { spacing, typography, useTheme } from './theme';

interface StateViewProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

/** Estado vacío / error a pantalla completa, con acción opcional. */
export const StateView = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: StateViewProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
};

export const LoadingView = ({ label = 'Cargando…' }: { label?: string }) => {
  const { colors } = useTheme();
  return (
    <View
      style={styles.container}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { ...typography.subtitle, textAlign: 'center' },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  action: { marginTop: spacing.lg },
});
