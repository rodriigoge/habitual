import { useMemo } from 'react';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { calculateHabitMetrics } from '../domain/calculateHabitMetrics';

export function useHabitMetrics(dates: readonly LocalDate[], today: LocalDate) {
  return useMemo(() => calculateHabitMetrics(dates, today), [dates, today]);
}
