import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useHabitMetrics } from '../hooks/useHabitMetrics';
import type { HabitWithHistory } from '../hooks/useHabits';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { DayStatus } from './DayStatus';
import { StreakIndicator } from './StreakIndicator';

export function HabitCard({
  habit,
  today,
  onToggleDay,
  onPress,
  error,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onPress?: () => void;
  onToggleDay?: (date: LocalDate) => void;
  error?: string;
}) {
  const metrics = useHabitMetrics(habit.completedDates, today);
  const days = useRecentActivity(habit.completedDates, habit.createdAt, today);
  return (
    <Pressable
      accessible={false}
      onPress={onPress}
      style={styles.container}
      testID={`habit-${habit.id}`}
    >
      <View style={styles.heading}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes de ${habit.name}`}
          onPress={onPress}
          style={styles.description}
        >
          <Text accessibilityRole="header" style={styles.name}>
            {habit.name}
          </Text>
          <Text style={styles.total}>
            {metrics.totalCompletions}{' '}
            {metrics.totalCompletions === 1 ? 'conclusão' : 'conclusões'}
          </Text>
        </Pressable>
        <Pressable accessible={false} onPress={onPress}>
          <StreakIndicator value={metrics.currentStreak} />
        </Pressable>
      </View>
      <View style={styles.days}>
        {days.map(({ date, completed, disabled }) => (
          <DayStatus
            key={date}
            date={date}
            today={today}
            habitName={habit.name}
            completed={completed}
            disabled={disabled}
            onPress={onToggleDay ? () => onToggleDay(date) : undefined}
          />
        ))}
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {error}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, gap: spacing.md },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.lg,
  },
  description: { flexGrow: 1, flexShrink: 1, gap: spacing.sm },
  name: { ...typography.habitName, color: colors.textPrimary },
  total: { ...typography.body, color: colors.textSecondary },
  days: { flexDirection: 'row' },
  error: { ...typography.caption, color: colors.danger },
});
