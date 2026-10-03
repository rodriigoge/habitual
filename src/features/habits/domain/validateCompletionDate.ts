import type { LocalDate } from '../../../shared/date/LocalDate';
import {
  differenceInCalendarDays,
  isFuture,
} from '../../../shared/date/dateUtils';

/** Accepts creation day through today, inclusive; otherwise throws RangeError.
 * All arguments are LocalDates, not createdAt timestamps. No clock is consulted.
 * Returns normally (void) when valid, including when all three days are equal.
 */
export function validateCompletionDate(
  completionDate: LocalDate,
  habitCreationDate: LocalDate,
  today: LocalDate,
): void {
  const daysSinceCreation = differenceInCalendarDays(
    completionDate,
    habitCreationDate,
  );
  const future = isFuture(completionDate, today);

  if (daysSinceCreation < 0) {
    throw new RangeError('Completion date cannot precede habit creation.');
  }
  if (future) {
    throw new RangeError('Completion date cannot be in the future.');
  }
}
