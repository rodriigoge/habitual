import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colors } from '../../tokens/colors';
import { controls } from '../../tokens/controls';
import { radius } from '../../tokens/radius';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';

export type ButtonProps = Pick<
  PressableProps,
  'onPress' | 'accessibilityHint' | 'testID'
> & {
  disabled?: boolean;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({
  label,
  variant = 'primary',
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: controls.minTouchTarget,
    minWidth: controls.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { backgroundColor: colors.danger },
  primary: { backgroundColor: colors.textPrimary },
  secondary: { backgroundColor: colors.surface },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.onAction,
    textAlign: 'center',
  },
  secondaryLabel: { color: colors.textPrimary },
  pressed: { opacity: controls.pressedOpacity },
  disabled: { opacity: controls.disabledOpacity },
});
