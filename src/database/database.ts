import type { DatabaseConnection } from './DatabaseConnection';
import { initialSchema } from './migrations/001_initial_schema';

// SQLiteProvider opens this file in Expo's persistent default database directory.
export const DATABASE_NAME = 'habitual.db';
const migrations = [initialSchema];

export async function initializeDatabase(
  db: DatabaseConnection,
): Promise<void> {
  // Foreign keys must be enabled on each connection, outside any transaction.
  db.execSync('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  if (
    db.getFirstSync<{ foreign_keys: number }>('PRAGMA foreign_keys')
      ?.foreign_keys !== 1
  ) {
    throw new Error('SQLite foreign keys could not be enabled.');
  }
  db.withTransactionSync(() => {
    const version = db.getFirstSync<{ user_version: number }>(
      'PRAGMA user_version',
    )!.user_version;
    if (version > migrations[migrations.length - 1].version) {
      throw new Error('Database schema is newer than this application.');
    }
    for (const migration of migrations) {
      if (migration.version > version) {
        db.execSync(migration.sql);
        // This number comes only from the static migration list, never user input.
        db.execSync(`PRAGMA user_version = ${migration.version}`);
      }
    }
  });
}
