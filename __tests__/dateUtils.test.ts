import type { LocalDate } from '../src/shared/date/LocalDate';
import {
  addDays,
  differenceInCalendarDays,
  getRecentDates,
  getToday,
  isFuture,
} from '../src/shared/date/dateUtils';

describe('LocalDate', () => {
  it.each(['0000-01-01', '0099-12-31', '2026-10-02', '9999-12-31'])(
    'preserves canonical format: %s',
    (date: LocalDate) => {
      expect(addDays(date, 0)).toBe(date);
    },
  );

  it.each([
    '',
    '2026-1-02',
    '26-10-02',
    '2026/10/02',
    ' 2026-10-02',
    '2026-10-02 ',
    '2026-10-02\n',
    '2026-10-02T00:00:00Z',
    '2026-00-01',
    '2026-13-01',
    '2026-01-00',
    '2026-01-32',
    '2026-04-31',
    '2026-02-29',
    '1900-02-29',
    '-001-01-01',
    '10000-01-01',
  ])('rejects invalid date %j across all utilities', (date) => {
    expect(() => addDays(date, 0)).toThrow(RangeError);
    expect(() => differenceInCalendarDays(date, '2026-10-02')).toThrow(
      RangeError,
    );
    expect(() => differenceInCalendarDays('2026-10-02', date)).toThrow(
      RangeError,
    );
    expect(() => isFuture(date, '2026-10-02')).toThrow(RangeError);
    expect(() => isFuture('2026-10-02', date)).toThrow(RangeError);
    expect(() => getRecentDates(date, 0)).toThrow(RangeError);
  });
});

describe('getToday', () => {
  afterEach(() => jest.useRealTimers());

  it.each([0, 12, 23])('reads the local calendar at hour %i', (hour) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 2, hour, 30));
    expect(getToday()).toBe('2026-10-02');
  });

  it('changes at local midnight', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 11, 31, 23, 59, 59, 999));
    expect(getToday()).toBe('2026-12-31');
    jest.advanceTimersByTime(1);
    expect(getToday()).toBe('2027-01-01');
  });

  it('pads single-digit months and days', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 2, 12));
    expect(getToday()).toBe('2026-01-02');
  });
});

describe('addDays', () => {
  it.each([
    ['2026-10-02', 3, '2026-10-05'],
    ['2026-10-02', -3, '2026-09-29'],
    ['2026-01-31', 1, '2026-02-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-01-01', -1, '2025-12-31'],
    ['2026-02-28', 1, '2026-03-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2024-02-28', 1, '2024-02-29'],
    ['2024-02-28', 2, '2024-03-01'],
    ['2024-03-01', -1, '2024-02-29'],
    ['1900-02-28', 1, '1900-03-01'],
    ['2000-02-28', 1, '2000-02-29'],
    ['0099-12-31', 1, '0100-01-01'],
    ['0000-02-28', 1, '0000-02-29'],
    ['2024-01-01', 366, '2025-01-01'],
    ['2025-01-01', -366, '2024-01-01'],
    // US daylight saving transitions and a historical Brazilian midnight shift.
    ['2026-03-08', 1, '2026-03-09'],
    ['2026-11-01', 1, '2026-11-02'],
    ['2018-11-03', 2, '2018-11-05'],
  ])('%s + %i days = %s', (date, amount, expected) => {
    expect(addDays(date, amount)).toBe(expected);
  });

  it.each([NaN, Infinity, -Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid amount %s',
    (amount) => expect(() => addDays('2026-10-02', amount)).toThrow(RangeError),
  );

  it.each([
    ['0000-01-01', -1],
    ['9999-12-31', 1],
    ['2026-10-02', Number.MAX_SAFE_INTEGER],
  ])('rejects out-of-range results for %s + %s', (date, amount) => {
    expect(() => addDays(date, amount)).toThrow(RangeError);
  });
});

describe('differenceInCalendarDays', () => {
  it.each([
    ['2026-10-02', '2026-10-02', 0],
    ['2026-10-02', '2026-09-27', 5],
    ['2026-09-27', '2026-10-02', -5],
    ['2027-01-01', '2026-12-31', 1],
    ['2026-03-01', '2026-02-28', 1],
    ['2024-03-01', '2024-02-28', 2],
    ['2025-01-01', '2024-01-01', 366],
    ['0100-01-01', '0099-12-31', 1],
    ['2026-03-09', '2026-03-08', 1],
    ['2026-11-02', '2026-11-01', 1],
    ['2018-11-05', '2018-11-03', 2],
  ])('%s minus %s = %i', (left, right, expected) => {
    expect(differenceInCalendarDays(left, right)).toBe(expected);
  });
});

describe('isFuture', () => {
  it.each([
    ['2026-10-03', true],
    ['2026-10-02', false],
    ['2026-10-01', false],
    ['2027-01-01', true],
    ['2025-12-31', false],
  ])('compares %s with an explicit today', (date, expected) => {
    expect(isFuture(date, '2026-10-02')).toBe(expected);
  });
});

describe('getRecentDates', () => {
  it('returns six days in chronological order across a month boundary', () => {
    expect(getRecentDates('2026-10-02', 6)).toEqual([
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('crosses a year boundary', () => {
    expect(getRecentDates('2027-01-02', 4)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('includes leap day', () => {
    expect(getRecentDates('2024-03-01', 3)).toEqual([
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
    ]);
  });

  it('supports zero and one day', () => {
    expect(getRecentDates('2026-10-02', 0)).toEqual([]);
    expect(getRecentDates('2026-10-02', 1)).toEqual(['2026-10-02']);
    expect(getRecentDates('0000-01-01', 1)).toEqual(['0000-01-01']);
  });

  it.each([-1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid count %s',
    (count) =>
      expect(() => getRecentDates('2026-10-02', count)).toThrow(RangeError),
  );

  it('rejects an interval outside the supported years before allocation', () => {
    expect(() => getRecentDates('0000-01-01', 2)).toThrow(RangeError);
    expect(() => getRecentDates('2026-10-02', Number.MAX_SAFE_INTEGER)).toThrow(
      RangeError,
    );
  });
});
