export type CreateHabitInput = { name: string };
export type UpdateHabitInput = { name: string };

export function normalizeHabitName(name: string): string {
  const normalized = name.trim();
  if (!normalized) throw new RangeError('Habit name cannot be empty.');
  return normalized;
}
