import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, typography, useTheme } from './theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Muestra "✕" para indicar que al tocarlo se quita (chips de filtros activos). */
  removable?: boolean;
}

/** Chip seleccionable. Área táctil >= 44pt (guías de accesibilidad iOS/Android). */
export const Chip = ({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
  removable,
}: ChipProps) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? colors.onPrimary : colors.text },
        ]}
      >
        {removable ? `${label}  ✕` : label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  label: { ...typography.caption },
});
