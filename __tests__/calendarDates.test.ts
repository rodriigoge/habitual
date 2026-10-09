import {
  getMonthWeeks,
  shiftMonth,
  startOfMonth,
} from '../src/shared/date/dateUtils';

describe('Calendar dates', () => {
  it.each([
    ['2026-02-10', 28],
    ['2024-02-10', 29],
    ['2026-10-03', 31],
    ['2026-04-01', 30],
  ])('contains every day once for %s', (date, count) => {
    const weeks = getMonthWeeks(date);
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(count);
    expect(new Set(days).size).toBe(count);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(days[0]).toBe(startOfMonth(date));
  });
  it('aligns Thursday October 1 in a Sunday-first grid', () => {
    expect(getMonthWeeks('2026-10-03')[0]).toEqual([
      null,
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
  });
  it('crosses years and starts on day one', () => {
    expect(shiftMonth('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftMonth('2027-01-31', -1)).toBe('2026-12-01');
  });
  it('supports the minimum and maximum LocalDate years', () => {
    expect(getMonthWeeks('0000-01-01').flat().filter(Boolean)).toHaveLength(31);
    expect(getMonthWeeks('9999-12-31').flat().filter(Boolean)).toHaveLength(31);
    expect(() => shiftMonth('0000-01-01', -1)).toThrow(RangeError);
    expect(() => shiftMonth('9999-12-01', 1)).toThrow(RangeError);
  });
  it('rejects invalid dates and fractional months', () => {
    expect(() => getMonthWeeks('2026-02-29')).toThrow(RangeError);
    expect(() => shiftMonth('2026-01-01', 1.5)).toThrow(RangeError);
  });
});
