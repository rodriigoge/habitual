import type { LocalDate } from '../../../shared/date/LocalDate';
import {
  addDays,
  differenceInCalendarDays,
  isFuture,
} from '../../../shared/date/dateUtils';
import type { HabitMetrics } from './HabitMetrics';

/** Derives metrics without mutating history or reading the clock.
 * Invalid dates (including today) and future completions throw RangeError.
 */
export function calculateHabitMetrics(
  completionDates: readonly LocalDate[],
  today: LocalDate,
): HabitMetrics {
  // Validate today even when the history is empty.
  addDays(today, 0);
  const dates = [...new Set(completionDates)];
  for (const date of dates) {
    if (isFuture(date, today)) {
      throw new RangeError('Completion date cannot be in the future.');
    }
  }
  dates.sort(differenceInCalendarDays);

  let run = 0;
  let bestStreak = 0;
  let previous: LocalDate | undefined;
  for (const date of dates) {
    run =
      previous !== undefined && differenceInCalendarDays(date, previous) === 1
        ? run + 1
        : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = date;
  }

  // The final run is current only if it ends today or yesterday. This avoids
  // stepping before the minimum LocalDate when the history starts in year 0000.
  const currentStreak =
    previous !== undefined && differenceInCalendarDays(today, previous) <= 1
      ? run
      : 0;

  return { currentStreak, bestStreak, totalCompletions: dates.length };
}
