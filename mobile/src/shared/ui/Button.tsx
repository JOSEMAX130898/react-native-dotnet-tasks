import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, typography, useTheme } from './theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  accessibilityHint?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  accessibilityHint,
}: ButtonProps) => {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.primary : colors.surface,
          borderColor: primary ? colors.primary : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: primary ? colors.onPrimary : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  label: { ...typography.subtitle, fontSize: 16 },
});
