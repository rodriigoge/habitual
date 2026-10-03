import { calculateHabitMetrics } from '../src/features/habits/domain/calculateHabitMetrics';
import { addDays, getRecentDates } from '../src/shared/date/dateUtils';

const today = '2026-10-02';

describe('calculateHabitMetrics', () => {
  it.each([
    { name: 'empty history', dates: [], current: 0, best: 0 },
    { name: 'today only', dates: [today], current: 1, best: 1 },
    { name: 'yesterday only', dates: ['2026-10-01'], current: 1, best: 1 },
    {
      name: 'day before yesterday only',
      dates: ['2026-09-30'],
      current: 0,
      best: 1,
    },
    {
      name: 'today and yesterday',
      dates: ['2026-10-01', today],
      current: 2,
      best: 2,
    },
    {
      name: 'yesterday and day before',
      dates: ['2026-09-30', '2026-10-01'],
      current: 2,
      best: 2,
    },
    {
      name: 'run including today',
      dates: getRecentDates(today, 4),
      current: 4,
      best: 4,
    },
    {
      name: 'run ending yesterday',
      dates: getRecentDates('2026-10-01', 3),
      current: 3,
      best: 3,
    },
    {
      name: 'gap before yesterday',
      dates: ['2026-09-28', '2026-09-30', '2026-10-01'],
      current: 2,
      best: 2,
    },
    {
      name: 'missing yesterday with today complete',
      dates: ['2026-09-29', '2026-09-30', today],
      current: 1,
      best: 2,
    },
    {
      name: 'older run with no current run',
      dates: getRecentDates('2026-09-30', 3),
      current: 0,
      best: 3,
    },
    {
      name: 'older best exceeds current run',
      dates: [...getRecentDates('2026-09-20', 5), '2026-10-01', today],
      current: 2,
      best: 5,
    },
  ])('$name', ({ dates, current, best }) => {
    expect(calculateHabitMetrics(dates, today)).toEqual({
      currentStreak: current,
      bestStreak: best,
      totalCompletions: dates.length,
    });
  });

  it('recalculates both streaks when a historical bridge is added or removed', () => {
    const disconnected = [
      '2026-09-26',
      '2026-09-27',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
    ];
    const connected = [...disconnected, '2026-09-28'];
    expect(calculateHabitMetrics(disconnected, today)).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      totalCompletions: 5,
    });
    expect(calculateHabitMetrics(connected, today)).toEqual({
      currentStreak: 6,
      bestStreak: 6,
      totalCompletions: 6,
    });
    expect(
      calculateHabitMetrics(
        connected.filter((date) => date !== '2026-09-28'),
        today,
      ),
    ).toEqual({ currentStreak: 3, bestStreak: 3, totalCompletions: 5 });
  });

  it.each([
    ['month', ['2026-09-30', '2026-10-01'], '2026-10-01', 2],
    ['year', ['2025-12-31', '2026-01-01'], '2026-01-01', 2],
    ['common February', ['2026-02-28', '2026-03-01'], '2026-03-01', 2],
    [
      'leap February',
      ['2024-02-28', '2024-02-29', '2024-03-01'],
      '2024-03-01',
      3,
    ],
    ['missing leap day', ['2024-02-28', '2024-03-01'], '2024-03-01', 1],
    ['minimum year', ['0000-01-01', '0000-01-02'], '0000-01-02', 2],
    ['maximum year', ['9999-12-30', '9999-12-31'], '9999-12-31', 2],
  ] as const)('handles %s', (_, dates, reference, streak) => {
    expect(calculateHabitMetrics(dates, reference)).toEqual({
      currentStreak: streak,
      bestStreak: streak,
      totalCompletions: dates.length,
    });
  });

  it('handles the first representable day without looking before it', () => {
    expect(calculateHabitMetrics([], '0000-01-01')).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    });
    expect(calculateHabitMetrics(['0000-01-01'], '0000-01-01')).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      totalCompletions: 1,
    });
  });

  it('is invariant to ordering and duplicates, without mutating the input', () => {
    const history = Object.freeze([
      today,
      '2026-09-30',
      '2026-10-01',
      today,
      '2026-09-30',
    ]);
    expect(calculateHabitMetrics(history, today)).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      totalCompletions: 3,
    });
    expect(history).toEqual([
      today,
      '2026-09-30',
      '2026-10-01',
      today,
      '2026-09-30',
    ]);
  });

  it('keeps total and best while current expires only after a missed day', () => {
    const history = getRecentDates(today, 10);
    expect(calculateHabitMetrics(history, today)).toEqual({
      currentStreak: 10,
      bestStreak: 10,
      totalCompletions: 10,
    });
    expect(calculateHabitMetrics(history, addDays(today, 1))).toEqual({
      currentStreak: 10,
      bestStreak: 10,
      totalCompletions: 10,
    });
    expect(calculateHabitMetrics(history, addDays(today, 2))).toEqual({
      currentStreak: 0,
      bestStreak: 10,
      totalCompletions: 10,
    });
  });

  it.each([1, 2, 7, 31, 366])(
    'derives an entire run of %i days and ignores duplicates',
    (length) => {
      const history = getRecentDates(today, length);
      expect(
        calculateHabitMetrics([...history, ...history].reverse(), today),
      ).toEqual({
        currentStreak: length,
        bestStreak: length,
        totalCompletions: length,
      });
    },
  );

  it.each(['2026-10-03', '2027-01-01'])(
    'rejects future completion %s instead of ignoring it',
    (date) => {
      expect(() => calculateHabitMetrics([today, date], today)).toThrow(
        RangeError,
      );
    },
  );

  it.each(['2026-02-29', '2026-1-01', '2026-10-02T00:00:00Z', ''])(
    'rejects invalid input %j',
    (date) => {
      expect(() => calculateHabitMetrics([date], today)).toThrow(RangeError);
      expect(() => calculateHabitMetrics([], date)).toThrow(RangeError);
    },
  );
});
