import { getRecentDates } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import type { HomeHabit } from '../components/HabitCard';

// Display-only examples. Metrics intentionally remain static in Milestone 5.
export function getHomeMockHabits(today: LocalDate): HomeHabit[] {
  const dates = getRecentDates(today, 6);
  return [
    {
      id: 'academia',
      name: 'Academia',
      currentStreak: 14,
      totalCompletions: 150,
      completedDates: dates.slice(0, 5),
    },
    {
      id: 'leitura',
      name: 'Leitura',
      currentStreak: 2,
      totalCompletions: 87,
      completedDates: [dates[0], dates[2], dates[4], dates[5]],
    },
    {
      id: 'meditacao',
      name: 'Meditação',
      currentStreak: 1,
      totalCompletions: 42,
      completedDates: [dates[1], dates[5]],
    },
  ];
}
