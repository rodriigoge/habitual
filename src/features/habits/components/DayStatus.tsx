import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { radius } from '../../../design-system/tokens/radius';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { formatLocalDate } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';

type DayStatusProps = {
  date: LocalDate;
  today: LocalDate;
  completed: boolean;
  habitName: string;
  disabled?: boolean;
  onPress?: () => void;
};

export function DayStatus({
  date,
  today,
  completed,
  habitName,
  disabled = false,
  onPress,
}: DayStatusProps) {
  const scale = useAnimatedValue(1);
  const unavailable = disabled || !onPress;
  const isToday = date === today;
  const description = formatLocalDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <Pressable
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed, disabled: unavailable }}
      accessibilityLabel={`${habitName}, ${description}${isToday ? ', hoje' : ''}, ${completed ? 'concluído' : 'não concluído'}`}
      disabled={unavailable}
      onPress={(event) => {
        event.stopPropagation();
        onPress?.();
        if (!completed)
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
      }}
      onPressIn={() =>
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 90,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.timing(scale, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }).start()
      }
      style={[styles.container, disabled && styles.disabled]}
    >
      <Text style={styles.weekday}>
        {formatLocalDate(date, { weekday: 'short' })}
      </Text>
      <Text style={[styles.day, isToday && styles.todayLabel]}>
        {formatLocalDate(date, { day: '2-digit' })}
      </Text>
      <Animated.View
        style={[
          styles.mark,
          completed && styles.completed,
          { transform: [{ scale }] },
        ]}
      />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: controls.minTouchTarget,
    minHeight: controls.minTouchTarget,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  disabled: { opacity: controls.disabledOpacity },
  weekday: { ...typography.caption, color: colors.textSecondary },
  day: { ...typography.body, color: colors.textPrimary },
  todayLabel: { fontWeight: '700' },
  mark: {
    width: controls.iconSize,
    height: controls.iconSize,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  completed: {
    backgroundColor: colors.completed,
    borderColor: colors.completed,
  },
});
