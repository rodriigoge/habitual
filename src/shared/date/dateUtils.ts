import type { LocalDate } from './LocalDate';

const MILLISECONDS_PER_DAY = 86_400_000;

function formatDate(year: number, month: number, day: number): LocalDate {
  if (!Number.isInteger(year) || year < 0 || year > 9999) {
    throw new RangeError('LocalDate must have a year between 0000 and 9999.');
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// UTC is only a timezone-independent calendar arithmetic workspace. These values
// never represent local instants or determine the user's current calendar day.
function parseDate(value: LocalDate): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError('LocalDate must use the YYYY-MM-DD format.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  // Unlike Date.UTC(year, ...), this preserves years 0000–0099.
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('LocalDate must be a valid calendar date.');
  }

  return date;
}

/** Returns today's local calendar day, without converting the clock to UTC. */
export function getToday(): LocalDate {
  return toLocalDate(new Date());
}

/** Converts an instant to its local calendar day; rejects invalid instants. */
export function toLocalDate(now: Date): LocalDate {
  if (!Number.isFinite(now.getTime())) throw new RangeError('Invalid date.');
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Adds whole calendar days. Invalid dates, amounts or results throw RangeError. */
export function addDays(date: LocalDate, amount: number): LocalDate {
  const calendarDate = parseDate(date);
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError('Day amount must be a safe integer.');
  }

  calendarDate.setUTCDate(calendarDate.getUTCDate() + amount);
  return formatDate(
    calendarDate.getUTCFullYear(),
    calendarDate.getUTCMonth() + 1,
    calendarDate.getUTCDate(),
  );
}

/** Signed whole-day difference: left minus right. Invalid dates throw RangeError. */
export function differenceInCalendarDays(
  left: LocalDate,
  right: LocalDate,
): number {
  return (
    (parseDate(left).getTime() - parseDate(right).getTime()) /
    MILLISECONDS_PER_DAY
  );
}

/** Compares against an explicit reference day; never reads the clock. */
export function isFuture(date: LocalDate, today: LocalDate): boolean {
  return differenceInCalendarDays(date, today) > 0;
}

/** Oldest first, ending in today. Zero returns []; invalid input throws RangeError. */
export function getRecentDates(today: LocalDate, count: number): LocalDate[] {
  parseDate(today);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Date count must be a non-negative safe integer.');
  }
  if (count === 0) return [];

  // Validate the entire interval before allocating the result.
  const first = addDays(today, 1 - count);
  return Array.from({ length: count }, (_, index) => addDays(first, index));
}

/** Formats a calendar day without shifting it to the device timezone. */
export function formatLocalDate(
  date: LocalDate,
  options: Pick<
    Intl.DateTimeFormatOptions,
    'weekday' | 'day' | 'month' | 'year'
  >,
): string {
  return new Intl.DateTimeFormat('pt-BR', {
    ...options,
    timeZone: 'UTC',
  }).format(parseDate(date));
}

/** First calendar day of the month containing date. */
export function startOfMonth(date: LocalDate): LocalDate {
  const parsed = parseDate(date);
  return formatDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1);
}

/** Moves to the first day of another month; rejects invalid/out-of-range input. */
export function shiftMonth(date: LocalDate, amount: number): LocalDate {
  if (!Number.isSafeInteger(amount))
    throw new RangeError('Invalid month amount.');
  const parsed = parseDate(startOfMonth(date));
  parsed.setUTCMonth(parsed.getUTCMonth() + amount);
  return formatDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1);
}

/** Sunday-first weeks. Empty cells belong outside the displayed month. */
export function getMonthWeeks(date: LocalDate): (LocalDate | null)[][] {
  const first = parseDate(startOfMonth(date));
  const end = new Date(first.getTime());
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  const count = end.getUTCDate();
  const offset = first.getUTCDay();
  const cells = Array.from(
    { length: Math.ceil((offset + count) / 7) * 7 },
    (_, index) =>
      index < offset || index >= offset + count
        ? null
        : addDays(startOfMonth(date), index - offset),
  );
  return Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}
