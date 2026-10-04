import { useMemo } from 'react';
import { getRecentDates, toLocalDate } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { validateCompletionDate } from '../domain/validateCompletionDate';

export function useRecentActivity(
  completedDates: readonly LocalDate[],
  createdAt: string,
  today: LocalDate,
) {
  return useMemo(() => {
    const creationDate = toLocalDate(new Date(createdAt));
    return getRecentDates(today, 6).map((date) => {
      let disabled = false;
      try {
        validateCompletionDate(date, creationDate, today);
      } catch {
        disabled = true;
      }
      return {
        date,
        completed: completedDates.includes(date),
        isToday: date === today,
        disabled,
      };
    });
  }, [completedDates, createdAt, today]);
}
