import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { DATABASE_NAME, initializeDatabase } from '../src/database/database';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <HabitsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </HabitsProvider>
    </SQLiteProvider>
  );
}
