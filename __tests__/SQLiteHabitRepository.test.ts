/** @jest-environment node */
import { initializeDatabase } from '../src/database/database';
import { SQLiteHabitRepository } from '../src/features/habits/repository/SQLiteHabitRepository';
import {
  addDays,
  differenceInCalendarDays,
  getToday,
} from '../src/shared/date/dateUtils';
import { TestDatabase } from './support/TestDatabase';

let db: TestDatabase;
let repository: SQLiteHabitRepository;
beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 2, 12));
  db = new TestDatabase();
  await initializeDatabase(db);
  repository = new SQLiteHabitRepository(db);
});
afterEach(() => {
  db.close();
  jest.useRealTimers();
});

it('creates unique IDs, trims names, sets timestamps and creates no completion', async () => {
  const first = await repository.create({ name: '  Read  ' });
  const second = await repository.create({ name: 'Read' });
  expect(first.name).toBe('Read');
  expect(first.id).toMatch(/^[0-9a-f]{32}$/);
  expect(second.id).not.toBe(first.id);
  expect(first.createdAt).toBe(new Date().toISOString());
  expect(first.updatedAt).toBe(first.createdAt);
  expect(await repository.findById(first.id)).toEqual(first);
  expect(await repository.getCompletions(first.id)).toEqual([]);
});

it.each(['', ' ', '\n\t'])(
  'rejects empty name %j for create and update',
  async (name) => {
    await expect(repository.create({ name })).rejects.toThrow(RangeError);
    const habit = await repository.create({ name: 'Read' });
    await expect(repository.update(habit.id, { name })).rejects.toThrow(
      RangeError,
    );
    expect(await repository.findById(habit.id)).toEqual(habit);
  },
);

it('returns explicit creation order, including timestamp ties', async () => {
  const first = await repository.create({ name: 'Z' });
  const second = await repository.create({ name: 'A' });
  jest.advanceTimersByTime(1000);
  const third = await repository.create({ name: 'B' });
  expect(await repository.findAll()).toEqual([first, second, third]);
});

it('updates only name and updatedAt, preserving creation and history', async () => {
  const habit = await repository.create({ name: 'Read' });
  await repository.toggleCompletion(habit.id, getToday());
  const history = await repository.getCompletions(habit.id);
  jest.advanceTimersByTime(1000);
  const updated = await repository.update(habit.id, { name: '  Learn  ' });
  expect(updated).toEqual({
    ...habit,
    name: 'Learn',
    updatedAt: new Date().toISOString(),
  });
  expect(updated.updatedAt).not.toBe(habit.updatedAt);
  expect(await repository.getCompletions(habit.id)).toEqual(history);
});

it('binds names and IDs containing SQL syntax', async () => {
  const name = "'); DROP TABLE habits; --";
  const habit = await repository.create({ name });
  expect((await repository.findById(habit.id))?.name).toBe(name);
  expect(await repository.findById("' OR 1=1 --")).toBeNull();
  expect(await repository.getCompletions("' OR 1=1 --")).toEqual([]);
  await repository.delete("' OR 1=1 --");
  expect(await repository.findAll()).toHaveLength(1);
});

it('handles absent habits explicitly and prevents orphan completions', async () => {
  expect(await repository.findById('missing')).toBeNull();
  expect(await repository.getCompletions('missing')).toEqual([]);
  await expect(repository.delete('missing')).resolves.toBeUndefined();
  await expect(repository.update('missing', { name: 'Read' })).rejects.toThrow(
    'Habit not found.',
  );
  await expect(
    repository.toggleCompletion('missing', getToday()),
  ).rejects.toThrow('Habit not found.');
  expect(() =>
    db.runSync('INSERT INTO habit_completions VALUES (?, ?, ?, ?)', [
      'orphan',
      'missing',
      getToday(),
      new Date().toISOString(),
    ]),
  ).toThrow();
});

it('toggles on/off, enforces uniqueness and allows the same day for different habits', async () => {
  const first = await repository.create({ name: 'Read' });
  const second = await repository.create({ name: 'Run' });
  await expect(repository.toggleCompletion(first.id, getToday())).resolves.toBe(
    true,
  );
  await expect(
    repository.toggleCompletion(second.id, getToday()),
  ).resolves.toBe(true);
  const [completion] = await repository.getCompletions(first.id);
  expect(completion).toEqual({
    id: expect.stringMatching(/^[0-9a-f]{32}$/),
    habitId: first.id,
    date: getToday(),
    createdAt: new Date().toISOString(),
  });
  expect(() =>
    db.runSync('INSERT INTO habit_completions VALUES (?, ?, ?, ?)', [
      'duplicate',
      first.id,
      getToday(),
      new Date().toISOString(),
    ]),
  ).toThrow();
  await expect(repository.toggleCompletion(first.id, getToday())).resolves.toBe(
    false,
  );
  expect(await repository.getCompletions(first.id)).toEqual([]);
  expect(await repository.getCompletions(second.id)).toHaveLength(1);
});

it('serializes rapid toggles across repository instances on the same connection', async () => {
  const habit = await repository.create({ name: 'Read' });
  const other = new SQLiteHabitRepository(db);
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      (i % 2 ? other : repository).toggleCompletion(habit.id, getToday()),
    ),
  );
  expect(results).toEqual(Array.from({ length: 20 }, (_, i) => i % 2 === 0));
  expect(await repository.getCompletions(habit.id)).toEqual([]);
});

it('rolls back failed inserts and leaves the connection usable', async () => {
  const habit = await repository.create({ name: 'Read' });
  db.execSync(
    "CREATE TRIGGER reject_completion BEFORE INSERT ON habit_completions BEGIN SELECT RAISE(ABORT, 'test failure'); END;",
  );
  await expect(
    repository.toggleCompletion(habit.id, getToday()),
  ).rejects.toThrow('test failure');
  expect(await repository.getCompletions(habit.id)).toEqual([]);
  db.execSync('DROP TRIGGER reject_completion');
  await expect(repository.toggleCompletion(habit.id, getToday())).resolves.toBe(
    true,
  );
});

it('validates local creation day and today, rejecting dates outside the interval', async () => {
  jest.setSystemTime(new Date(2026, 9, 2, 23, 30));
  const creation = getToday();
  const habit = await repository.create({ name: 'Read' });
  await expect(repository.toggleCompletion(habit.id, creation)).resolves.toBe(
    true,
  );
  jest.setSystemTime(new Date(2026, 9, 5, 0, 30));
  await expect(repository.toggleCompletion(habit.id, getToday())).resolves.toBe(
    true,
  );
  await expect(
    repository.toggleCompletion(habit.id, addDays(creation, -1)),
  ).rejects.toThrow(RangeError);
  await expect(
    repository.toggleCompletion(habit.id, addDays(getToday(), 1)),
  ).rejects.toThrow(RangeError);
  await expect(
    repository.toggleCompletion(habit.id, '2026-02-29'),
  ).rejects.toThrow(RangeError);
  expect(await repository.getCompletions(habit.id)).toHaveLength(2);
});

it('orders history and queries inclusive intervals', async () => {
  const habit = await repository.create({ name: 'Read' });
  jest.setSystemTime(new Date(2026, 9, 8, 12));
  for (const date of ['2026-10-06', '2026-10-02', '2026-10-08', '2026-10-04'])
    await repository.toggleCompletion(habit.id, date);
  expect(
    (await repository.getCompletions(habit.id)).map((row) => row.date),
  ).toEqual(['2026-10-02', '2026-10-04', '2026-10-06', '2026-10-08']);
  expect(
    (
      await repository.getCompletionsBetween(
        habit.id,
        '2026-10-04',
        '2026-10-06',
      )
    ).map((row) => row.date),
  ).toEqual(['2026-10-04', '2026-10-06']);
  expect(
    await repository.getCompletionsBetween(
      habit.id,
      '2026-10-04',
      '2026-10-04',
    ),
  ).toHaveLength(1);
  await expect(
    repository.getCompletionsBetween(habit.id, '2026-10-06', '2026-10-04'),
  ).rejects.toThrow(RangeError);
  await expect(
    repository.getCompletionsBetween(habit.id, 'invalid', '2026-10-04'),
  ).rejects.toThrow(RangeError);
});

it('deletes a five-year completion history through cascade', async () => {
  jest.setSystemTime(new Date(2021, 9, 9, 12));
  const habit = await repository.create({ name: 'Read' });
  jest.setSystemTime(new Date(2026, 9, 2, 12));
  const other = await repository.create({ name: 'Run' });
  const today = getToday();

  for (let index = 0; ; index += 1) {
    const date = addDays('2021-10-09', index);
    if (differenceInCalendarDays(date, today) > 0) break;
    await repository.toggleCompletion(habit.id, date);
  }
  await repository.toggleCompletion(other.id, today);
  const historyLength = differenceInCalendarDays(today, '2021-10-09') + 1;
  expect(await repository.getCompletions(habit.id)).toHaveLength(historyLength);

  await repository.delete(habit.id);
  expect(await repository.findById(habit.id)).toBeNull();
  expect(await repository.getCompletions(habit.id)).toEqual([]);
  expect(await repository.getCompletions(other.id)).toHaveLength(1);
});

it('deletes through cascade without affecting another habit', async () => {
  const first = await repository.create({ name: 'Read' });
  const second = await repository.create({ name: 'Run' });
  await repository.toggleCompletion(first.id, getToday());
  await repository.toggleCompletion(second.id, getToday());
  await repository.delete(first.id);
  expect(await repository.findById(first.id)).toBeNull();
  expect(await repository.getCompletions(first.id)).toEqual([]);
  expect(await repository.getCompletions(second.id)).toHaveLength(1);
});
