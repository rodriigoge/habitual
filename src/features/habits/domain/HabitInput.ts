export type CreateHabitInput = { name: string };
export type UpdateHabitInput = { name: string };

export const MAX_HABIT_NAME_LENGTH = 80;

export function normalizeHabitName(name: string): string {
  const normalized = name.trim();
  if (!normalized) throw new RangeError('Habit name cannot be empty.');
  if (normalized.length > MAX_HABIT_NAME_LENGTH)
    throw new RangeError('Habit name is too long.');
  return normalized;
}
