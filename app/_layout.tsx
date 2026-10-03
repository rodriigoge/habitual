import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { DATABASE_NAME, initializeDatabase } from '../src/database/database';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}
