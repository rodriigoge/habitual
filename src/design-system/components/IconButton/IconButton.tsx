import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { colors } from '../../tokens/colors';
import { controls } from '../../tokens/controls';
import { radius } from '../../tokens/radius';

export type IconButtonProps = Pick<
  PressableProps,
  'onPress' | 'accessibilityHint' | 'testID'
> & {
  disabled?: boolean;
  accessibilityLabel: string;
  renderIcon: (props: { color: string; size: number }) => ReactNode;
};

export function IconButton({
  renderIcon,
  accessibilityLabel,
  disabled = false,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        {renderIcon({ color: colors.textPrimary, size: controls.iconSize })}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: controls.minTouchTarget,
    minWidth: controls.minTouchTarget,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surface,
    opacity: controls.pressedOpacity,
  },
  disabled: { opacity: controls.disabledOpacity },
});
