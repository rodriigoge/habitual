import { DatabaseSync } from 'node:sqlite';
import type { DatabaseConnection } from '../../src/database/DatabaseConnection';

// Executes real SQL; adapts only the connection API for tests outside Expo.
export class TestDatabase implements DatabaseConnection {
  readonly native: DatabaseSync;
  constructor(path = ':memory:') {
    this.native = new DatabaseSync(path, {
      enableForeignKeyConstraints: false,
    });
  }
  execSync(sql: string): void {
    this.native.exec(sql);
  }
  runSync(
    sql: string,
    params: (string | number | null)[],
  ): { changes: number } {
    return { changes: Number(this.native.prepare(sql).run(...params).changes) };
  }
  getFirstSync<T>(
    sql: string,
    params: (string | number | null)[] = [],
  ): T | null {
    return (this.native.prepare(sql).get(...params) as T | undefined) ?? null;
  }
  getAllSync<T>(sql: string, params: (string | number | null)[] = []): T[] {
    return this.native.prepare(sql).all(...params) as T[];
  }
  withTransactionSync(task: () => void): void {
    this.execSync('BEGIN');
    try {
      task();
      this.execSync('COMMIT');
    } catch (error) {
      this.execSync('ROLLBACK');
      throw error;
    }
  }
  close(): void {
    this.native.close();
  }
}
