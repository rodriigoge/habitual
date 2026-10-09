import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import { IconButton } from '../../../design-system/components/IconButton/IconButton';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import {
  differenceInCalendarDays,
  formatLocalDate,
  getMonthWeeks,
  shiftMonth,
  startOfMonth,
  toLocalDate,
} from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { validateCompletionDate } from '../domain/validateCompletionDate';
import type { HabitWithHistory } from '../hooks/useHabits';
import { DayStatus } from './DayStatus';

const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function HabitCalendar({
  habit,
  today,
  onToggleDay,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onToggleDay?: (date: LocalDate) => void;
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(today));
  const createdDate = toLocalDate(new Date(habit.createdAt));
  const firstMonth = startOfMonth(createdDate);
  const lastMonth = startOfMonth(today);
  const month =
    differenceInCalendarDays(selectedMonth, lastMonth) > 0
      ? lastMonth
      : differenceInCalendarDays(selectedMonth, firstMonth) < 0
        ? firstMonth
        : selectedMonth;
  const previousDisabled = differenceInCalendarDays(month, firstMonth) <= 0;
  const nextDisabled = differenceInCalendarDays(month, lastMonth) >= 0;
  const gridOpacity = useAnimatedValue(1);
  const previousMonth = useRef(month);
  useEffect(() => {
    if (previousMonth.current === month) return;
    previousMonth.current = month;
    Animated.sequence([
      Animated.timing(gridOpacity, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();
  }, [gridOpacity, month]);

  return (
    <View style={styles.calendar}>
      <View style={styles.navigation}>
        <IconButton
          accessibilityLabel="Mês anterior"
          disabled={previousDisabled}
          onPress={() => setSelectedMonth(shiftMonth(month, -1))}
          renderIcon={({ color, size }) => (
            <Text style={{ color, fontSize: size }}>‹</Text>
          )}
        />
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          style={styles.title}
        >
          {formatLocalDate(month, { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton
          accessibilityLabel="Mês seguinte"
          disabled={nextDisabled}
          onPress={() => setSelectedMonth(shiftMonth(month, 1))}
          renderIcon={({ color, size }) => (
            <Text style={{ color, fontSize: size }}>›</Text>
          )}
        />
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.grid}
        showsHorizontalScrollIndicator
      >
        <Animated.View style={[styles.weeks, { opacity: gridOpacity }]}>
          <View style={styles.row}>
            {weekdays.map((day) => (
              <Text key={day} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>
          {getMonthWeeks(month).map((week, index) => (
            <View key={index} style={styles.row}>
              {week.map((date, column) => {
                if (!date) return <View key={column} style={styles.empty} />;
                let disabled = false;
                try {
                  validateCompletionDate(date, createdDate, today);
                } catch {
                  disabled = true;
                }
                return (
                  <DayStatus
                    key={date}
                    date={date}
                    today={today}
                    habitName={habit.name}
                    completed={habit.completedDates.includes(date)}
                    disabled={disabled}
                    compact
                    onPress={onToggleDay ? () => onToggleDay(date) : undefined}
                  />
                );
              })}
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  calendar: { gap: spacing.sm },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.habitName,
    flexShrink: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  grid: { flexGrow: 1 },
  weeks: { flex: 1, minWidth: controls.minTouchTarget * 7 },
  row: { flexDirection: 'row' },
  weekday: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
    minWidth: controls.minTouchTarget,
  },
  empty: { flex: 1, minWidth: controls.minTouchTarget },
});
