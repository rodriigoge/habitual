import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Stack } from 'expo-router';
import Home from '../app/index';
import DetailsRoute from '../app/habit/[id]';
import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { initializeDatabase } from '../src/database/database';
import { SQLiteHabitRepository } from '../src/features/habits/repository/SQLiteHabitRepository';
import { TestDatabase } from './support/TestDatabase';

let mockDatabase: TestDatabase;
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => mockDatabase }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

function Layout() {
  return (
    <HabitsProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </HabitsProvider>
  );
}
async function openApp(initialUrl = '/') {
  await renderRouter(
    { _layout: Layout, index: Home, 'habit/[id]': DetailsRoute },
    { initialUrl },
  );
}

describe('Habit Details', () => {
  let repository: SQLiteHabitRepository;
  let habitId: string;
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 10, 12));
    mockDatabase = new TestDatabase();
    await initializeDatabase(mockDatabase);
    repository = new SQLiteHabitRepository(mockDatabase);
    habitId = (await repository.create({ name: 'Leitura' })).id;
    jest.setSystemTime(new Date(2026, 9, 3, 12));
    for (const date of [
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-10-02',
    ]) {
      await repository.toggleCompletion(habitId, date);
    }
  });
  afterEach(() => {
    mockDatabase.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('opens Details from Home with the same metrics, best streak and back navigation', async () => {
    await openApp();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Ver detalhes de Leitura' }),
    );
    expect(
      await screen.findByRole('header', { name: 'Histórico' }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(screen.getByText('4 conclusões')).toBeOnTheScreen();
    expect(screen.getByLabelText('Melhor sequência: 3 dias')).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    expect(
      screen.getByRole('button', { name: 'Editar hábito' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(
      await screen.findByRole('header', { name: 'Meus hábitos' }),
    ).toBeOnTheScreen();
  });

  it('does not navigate when a Home day is toggled', async () => {
    await openApp();
    await screen.findByText('Leitura');
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /3 de outubro.*hoje/ }),
    );
    expect(
      screen.getByRole('header', { name: 'Meus hábitos' }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Histórico' })).toBeNull();
  });

  it('handles a missing habit and returns Home from a direct link', async () => {
    await openApp('/habit/missing');
    expect(await screen.findByText('Hábito não encontrado.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Meus hábitos')).toBeOnTheScreen();
  });
});
