import type { DatabaseConnection } from '../../../database/DatabaseConnection';
import type { LocalDate } from '../../../shared/date/LocalDate';
import {
  addDays,
  differenceInCalendarDays,
  getToday,
  toLocalDate,
} from '../../../shared/date/dateUtils';
import type { Habit } from '../domain/Habit';
import type { HabitCompletion } from '../domain/HabitCompletion';
import {
  normalizeHabitName,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '../domain/HabitInput';
import { validateCompletionDate } from '../domain/validateCompletionDate';
import type { HabitRepository } from './HabitRepository';

// SQL aliases keep the row-to-domain mapping in one place.
const habitColumns =
  'id, name, created_at AS createdAt, updated_at AS updatedAt';
const completionColumns =
  'id, habit_id AS habitId, date, created_at AS createdAt';

export class SQLiteHabitRepository implements HabitRepository {
  constructor(private readonly db: DatabaseConnection) {}

  private requireHabit(id: string): Habit {
    const habit = this.db.getFirstSync<Habit>(
      `SELECT ${habitColumns} FROM habits WHERE id = ?`,
      [id],
    );
    if (!habit) throw new Error('Habit not found.');
    return habit;
  }

  async findAll(): Promise<Habit[]> {
    return this.db.getAllSync<Habit>(
      `SELECT ${habitColumns} FROM habits ORDER BY created_at ASC, rowid ASC`,
    );
  }

  async findById(id: string): Promise<Habit | null> {
    return this.db.getFirstSync<Habit>(
      `SELECT ${habitColumns} FROM habits WHERE id = ?`,
      [id],
    );
  }

  async create(input: CreateHabitInput): Promise<Habit> {
    const name = normalizeHabitName(input.name);
    const timestamp = new Date().toISOString();
    // 128 random bits from SQLite itself; the primary key enforces uniqueness.
    return this.db.getFirstSync<Habit>(
      `INSERT INTO habits (id, name, created_at, updated_at)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?) RETURNING ${habitColumns}`,
      [name, timestamp, timestamp],
    )!;
  }

  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    const name = normalizeHabitName(input.name);
    const habit = this.db.getFirstSync<Habit>(
      `UPDATE habits SET name = ?, updated_at = ? WHERE id = ? RETURNING ${habitColumns}`,
      [name, new Date().toISOString(), id],
    );
    if (!habit) throw new Error('Habit not found.');
    return habit;
  }

  // Deleting an absent habit is an idempotent no-op; reads return null/empty lists.
  async delete(id: string): Promise<void> {
    this.db.runSync('DELETE FROM habits WHERE id = ?', [id]);
  }

  async getCompletions(habitId: string): Promise<HabitCompletion[]> {
    return this.db.getAllSync<HabitCompletion>(
      `SELECT ${completionColumns} FROM habit_completions WHERE habit_id = ? ORDER BY date ASC`,
      [habitId],
    );
  }

  async getCompletionsBetween(
    habitId: string,
    startDate: LocalDate,
    endDate: LocalDate,
  ): Promise<HabitCompletion[]> {
    if (differenceInCalendarDays(startDate, endDate) > 0) {
      throw new RangeError('Start date cannot be after end date.');
    }
    return this.db.getAllSync<HabitCompletion>(
      `SELECT ${completionColumns} FROM habit_completions
       WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date ASC`,
      [habitId, startDate, endDate],
    );
  }

  async toggleCompletion(habitId: string, date: LocalDate): Promise<boolean> {
    addDays(date, 0);
    let completed = false;
    // No awaits inside: rapid calls cannot interleave the read/modify/commit on
    // this connection. SQLite transactions and constraints protect other writers.
    this.db.withTransactionSync(() => {
      const habit = this.requireHabit(habitId);
      const removed = this.db.runSync(
        'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
        [habitId, date],
      );
      if (removed.changes > 0) return;
      validateCompletionDate(
        date,
        toLocalDate(new Date(habit.createdAt)),
        getToday(),
      );
      this.db.runSync(
        `INSERT INTO habit_completions (id, habit_id, date, created_at)
         VALUES (lower(hex(randomblob(16))), ?, ?, ?)`,
        [habitId, date, new Date().toISOString()],
      );
      completed = true;
    });
    return completed;
  }
}
