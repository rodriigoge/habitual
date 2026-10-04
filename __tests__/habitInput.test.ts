import {
  MAX_HABIT_NAME_LENGTH,
  normalizeHabitName,
} from '../src/features/habits/domain/HabitInput';

describe('Habit name', () => {
  it('normalizes surrounding whitespace', () => {
    expect(normalizeHabitName('  Ler  ')).toBe('Ler');
  });
  it.each(['', '   ', 'a'.repeat(MAX_HABIT_NAME_LENGTH + 1)])(
    'rejects invalid name',
    (name) => {
      expect(() => normalizeHabitName(name)).toThrow(RangeError);
    },
  );
  it('accepts the exact maximum length', () => {
    const name = 'a'.repeat(MAX_HABIT_NAME_LENGTH);
    expect(normalizeHabitName(name)).toBe(name);
  });
});
