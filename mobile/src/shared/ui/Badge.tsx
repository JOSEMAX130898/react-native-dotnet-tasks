import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from './theme';

interface BadgeProps {
  label: string;
  color: { fg: string; bg: string };
  /** Punto de color a la izquierda: el significado no depende solo del color del texto. */
  dot?: boolean;
}

export const Badge = ({ label, color, dot = true }: BadgeProps) => (
  <View style={[styles.badge, { backgroundColor: color.bg }]}>
    {dot ? <View style={[styles.dot, { backgroundColor: color.fg }]} /> : null}
    <Text style={[styles.label, { color: color.fg }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { ...typography.caption, fontSize: 12 },
});
