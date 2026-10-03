import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { controls } from '../../tokens/controls';
import { radius } from '../../tokens/radius';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';

type AccessibleName =
  | { label: string; accessibilityLabel?: string }
  | { label?: never; accessibilityLabel: string };
export type TextFieldProps = AccessibleName &
  Pick<
    TextInputProps,
    | 'placeholder'
    | 'keyboardType'
    | 'returnKeyType'
    | 'autoFocus'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'maxLength'
    | 'onSubmitEditing'
    | 'onFocus'
    | 'onBlur'
    | 'accessibilityHint'
    | 'testID'
  > & {
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    disabled?: boolean;
  };

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField(
    {
      label,
      accessibilityLabel,
      value,
      onChangeText,
      error,
      disabled = false,
      onFocus,
      onBlur,
      accessibilityHint,
      ...props
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const hint =
      [accessibilityHint, error].filter(Boolean).join('. ') || undefined;
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          {...props}
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={hint}
          accessibilityState={{ disabled }}
          editable={!disabled}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          underlineColorAndroid="transparent"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            focused && !disabled && styles.focused,
            Boolean(error) && styles.errorBorder,
            disabled && styles.disabled,
          ]}
        />
        {error ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);
const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    minHeight: controls.minTouchTarget,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  focused: {
    borderColor: colors.accent,
    borderWidth: 2,
    paddingHorizontal: spacing.lg - 1,
    paddingVertical: spacing.md - 1,
  },
  errorBorder: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  disabled: {
    backgroundColor: colors.surface,
    opacity: controls.disabledOpacity,
  },
});
