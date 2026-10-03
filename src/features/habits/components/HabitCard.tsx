import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { getRecentDates } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import type { Habit } from '../domain/Habit';
import type { HabitMetrics } from '../domain/HabitMetrics';
import { DayStatus } from './DayStatus';
import { StreakIndicator } from './StreakIndicator';

export type HomeHabit = Pick<Habit, 'id' | 'name'> &
  Pick<HabitMetrics, 'currentStreak' | 'totalCompletions'> & {
    completedDates: readonly LocalDate[];
  };

export function HabitCard({
  habit,
  today,
}: {
  habit: HomeHabit;
  today: LocalDate;
}) {
  return (
    <View style={styles.container} testID={`habit-${habit.id}`}>
      <View style={styles.heading}>
        <View style={styles.description}>
          <Text accessibilityRole="header" style={styles.name}>
            {habit.name}
          </Text>
          <Text style={styles.total}>
            {habit.totalCompletions}{' '}
            {habit.totalCompletions === 1 ? 'conclusão' : 'conclusões'}
          </Text>
        </View>
        <StreakIndicator value={habit.currentStreak} />
      </View>
      <View style={styles.days}>
        {getRecentDates(today, 6).map((date) => (
          <DayStatus
            key={date}
            date={date}
            today={today}
            habitName={habit.name}
            completed={habit.completedDates.includes(date)}
          />
        ))}
      </View>
    </View>
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
});
