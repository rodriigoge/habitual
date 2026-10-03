import type { LocalDate } from '../../../shared/date/LocalDate';

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: LocalDate;
  createdAt: string;
};
