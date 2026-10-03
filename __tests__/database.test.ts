/** @jest-environment node */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DATABASE_NAME, initializeDatabase } from '../src/database/database';
import { SQLiteHabitRepository } from '../src/features/habits/repository/SQLiteHabitRepository';
import { getToday } from '../src/shared/date/dateUtils';
import { TestDatabase } from './support/TestDatabase';

it('installs the schema and index once and enables foreign keys', async () => {
  const db = new TestDatabase();
  try {
    expect(db.getFirstSync('PRAGMA foreign_keys')).toEqual({ foreign_keys: 0 });
    await initializeDatabase(db);
    expect(db.getFirstSync('PRAGMA foreign_keys')).toEqual({ foreign_keys: 1 });
    expect(
      db
        .getAllSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .map((row) => row.name),
    ).toEqual(['habit_completions', 'habits']);
    expect(
      db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_habit_completions_habit_date'",
      ),
    ).not.toBeNull();
    expect(
      db
        .getAllSync<{ name: string }>('PRAGMA table_info(habits)')
        .map((row) => row.name),
    ).toEqual(['id', 'name', 'created_at', 'updated_at']);
    expect(
      db
        .getAllSync<{ name: string }>('PRAGMA table_info(habit_completions)')
        .map((row) => row.name),
    ).toEqual(['id', 'habit_id', 'date', 'created_at']);
    const version = db.getFirstSync('PRAGMA schema_version');
    await initializeDatabase(db);
    expect(db.getFirstSync('PRAGMA schema_version')).toEqual(version);
    expect(db.getFirstSync('PRAGMA user_version')).toEqual({ user_version: 1 });
  } finally {
    db.close();
  }
});

it('rolls back partial migrations and their version on failure', async () => {
  const db = new TestDatabase();
  try {
    db.execSync('CREATE TABLE habit_completions (sentinel TEXT);');
    await expect(initializeDatabase(db)).rejects.toThrow();
    expect(
      db.getFirstSync("SELECT name FROM sqlite_master WHERE name = 'habits'"),
    ).toBeNull();
    expect(db.getFirstSync('PRAGMA user_version')).toEqual({ user_version: 0 });
  } finally {
    db.close();
  }
});

it('rejects newer schemas without downgrading', async () => {
  const db = new TestDatabase();
  try {
    db.execSync('PRAGMA user_version = 2');
    await expect(initializeDatabase(db)).rejects.toThrow('newer');
    expect(db.getFirstSync('PRAGMA user_version')).toEqual({ user_version: 2 });
  } finally {
    db.close();
  }
});

it('preserves data across closing/reopening a persistent database and reenables cascade', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'habitual-sqlite-'));
  const filename = join(directory, DATABASE_NAME);
  let db = new TestDatabase(filename);
  try {
    expect(DATABASE_NAME).not.toBe(':memory:');
    await initializeDatabase(db);
    const repository = new SQLiteHabitRepository(db);
    const habit = await repository.create({ name: 'Persisted' });
    await repository.toggleCompletion(habit.id, getToday());
    const history = await repository.getCompletions(habit.id);
    db.close();
    db = new TestDatabase(filename);
    await initializeDatabase(db);
    const reopened = new SQLiteHabitRepository(db);
    expect(await reopened.findById(habit.id)).toEqual(habit);
    expect(await reopened.getCompletions(habit.id)).toEqual(history);
    await reopened.delete(habit.id);
    expect(await reopened.getCompletions(habit.id)).toEqual([]);
  } finally {
    db.close();
    // mkdtemp creates this isolated directory under the OS temporary directory.
    rmSync(directory, { recursive: true, force: true });
  }
});
