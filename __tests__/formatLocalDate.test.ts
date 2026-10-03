import { formatLocalDate } from '../src/shared/date/dateUtils';

describe('formatLocalDate', () => {
  it('formats a Portuguese calendar date without shifting the day', () => {
    expect(
      formatLocalDate('2026-10-03', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    ).toBe('3 de outubro de 2026');
    expect(formatLocalDate('2026-10-03', { weekday: 'short' })).toBe('sáb.');
    expect(formatLocalDate('2026-10-03', { day: '2-digit' })).toBe('03');
  });
  it.each(['2027-01-01', '2024-02-29'])(
    'preserves %s at calendar boundaries',
    (date) => {
      expect(formatLocalDate(date, { day: '2-digit' })).toBe(
        date === '2027-01-01' ? '01' : '29',
      );
    },
  );
  it.each(['2026-02-29', '2026-13-01', '03/10/2026', ''])(
    'rejects invalid date %s',
    (date) => {
      expect(() => formatLocalDate(date, { day: 'numeric' })).toThrow(
        RangeError,
      );
    },
  );
});
