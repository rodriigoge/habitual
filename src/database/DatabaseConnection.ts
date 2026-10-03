// The subset of Expo's synchronous connection used by persistence. Transactions
// never yield to another JS operation. The repository still exposes Promise APIs.
export interface DatabaseConnection {
  execSync(sql: string): void;
  runSync(sql: string, params: (string | number | null)[]): { changes: number };
  getFirstSync<T>(sql: string): T | null;
  getFirstSync<T>(sql: string, params: (string | number | null)[]): T | null;
  getAllSync<T>(sql: string): T[];
  getAllSync<T>(sql: string, params: (string | number | null)[]): T[];
  withTransactionSync(task: () => void): void;
}
