import { StyleSheet, Text, View } from 'react-native';
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
};

export function DayStatus({
  date,
  today,
  completed,
  habitName,
}: DayStatusProps) {
  const isToday = date === today;
  const description = formatLocalDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <View
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed, disabled: true }}
      accessibilityLabel={`${habitName}, ${description}${isToday ? ', hoje' : ''}, ${completed ? 'concluído' : 'não concluído'}`}
      style={[styles.container, isToday && styles.today]}
    >
      <Text style={styles.weekday}>
        {formatLocalDate(date, { weekday: 'short' })}
      </Text>
      <Text style={[styles.day, isToday && styles.todayLabel]}>
        {formatLocalDate(date, { day: '2-digit' })}
      </Text>
      <View style={[styles.mark, completed && styles.completed]}>
        {completed && <Text style={styles.check}>✓</Text>}
      </View>
    </View>
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
    borderRadius: radius.control,
  },
  today: { backgroundColor: colors.surface },
  weekday: { ...typography.caption, color: colors.textSecondary },
  day: { ...typography.body, color: colors.textPrimary },
  todayLabel: { fontWeight: '700', textDecorationLine: 'underline' },
  mark: {
    width: controls.iconSize,
    height: controls.iconSize,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: {
    backgroundColor: colors.completed,
    borderColor: colors.completed,
  },
  check: { ...typography.caption, color: colors.onAction },
});
