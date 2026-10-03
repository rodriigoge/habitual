import { toLocalDate } from '../src/shared/date/dateUtils';

it('converts timestamps to local days at both edges of the day', () => {
  for (const hour of [0, 23]) {
    const instant = new Date(2026, 9, 2, hour, 30);
    expect(toLocalDate(new Date(instant.toISOString()))).toBe('2026-10-02');
  }
});
it('rejects invalid timestamps', () => {
  expect(() => toLocalDate(new Date(NaN))).toThrow(RangeError);
});
