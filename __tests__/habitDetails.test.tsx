import {
  renderRouter,
  screen,
  fireEvent,
  act,
} from 'expo-router/testing-library';
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
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
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

  it('edits history beyond Home, derives best streak and synchronizes Home', async () => {
    await openApp();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Ver detalhes de Leitura' }),
    );
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 14 de setembro/ }),
    );
    expect(screen.getByLabelText('Melhor sequência: 4 dias')).toBeOnTheScreen();
    expect(screen.getByText('5 conclusões')).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 16 de setembro/ }),
    );
    expect(screen.getByLabelText('Melhor sequência: 2 dias')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Mês seguinte' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 3 de outubro/ }),
    );
    expect(screen.getByLabelText('2 dias seguidos')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Meus hábitos')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('5 conclusões')).toBeOnTheScreen();
    expect(await repository.getCompletions(habitId)).toHaveLength(5);
  });

  it('shows optimistic calendar metrics and rolls back even after navigating Home', async () => {
    let reject!: (reason: Error) => void;
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((_, no) => {
            reject = no;
          }),
      );
    await openApp();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Ver detalhes de Leitura' }),
    );
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 3 de outubro/ }),
    );
    expect(screen.getByLabelText('2 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('5 conclusões')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await act(async () => reject(new Error('write failed')));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a conclusão. Tente novamente.',
    );
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(screen.getByText('4 conclusões')).toBeOnTheScreen();
    expect(await repository.getCompletions(habitId)).toHaveLength(4);
  });

  it('does not persist future or pre-creation calendar dates', async () => {
    const toggle = jest.spyOn(
      SQLiteHabitRepository.prototype,
      'toggleCompletion',
    );
    await openApp('/habit/' + habitId);
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 4 de outubro/ }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 9 de setembro/ }),
    );
    expect(toggle).not.toHaveBeenCalled();
  });

  it('edits only the name and synchronizes Home without changing identity or history', async () => {
    const before = await repository.findById(habitId);
    const completions = await repository.getCompletions(habitId);
    await openApp();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Ver detalhes de Leitura' }),
    );
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar hábito' }),
    );
    expect(screen.getByLabelText('Nome do hábito')).toHaveDisplayValue(
      'Leitura',
    );
    await fireEvent.changeText(screen.getByLabelText('Nome do hábito'), '   ');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      '  Ler todos os dias  ',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(
      await screen.findByRole('header', { name: 'Ler todos os dias' }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Melhor sequência: 3 dias')).toBeOnTheScreen();
    expect(await repository.findById(habitId)).toMatchObject({
      id: habitId,
      createdAt: before!.createdAt,
      name: 'Ler todos os dias',
    });
    expect(await repository.getCompletions(habitId)).toEqual(completions);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(
      await screen.findByRole('button', {
        name: 'Ver detalhes de Ler todos os dias',
      }),
    ).toBeOnTheScreen();
    expect(screen.getByText('4 conclusões')).toBeOnTheScreen();
  });

  it('retains a failed edit for retry and supports cancellation without saving', async () => {
    await openApp('/habit/' + habitId);
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar hábito' }),
    );
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      'Rascunho',
    );
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'update')
      .mockRejectedValueOnce(new Error('write failed'));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar o hábito. Tente novamente.',
    );
    expect(screen.getByLabelText('Nome do hábito')).toHaveDisplayValue(
      'Rascunho',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('header', { name: 'Leitura' })).toBeOnTheScreen();
    expect((await repository.findById(habitId))!.name).toBe('Leitura');
  });

  it('cancels deletion without removing the habit or completions', async () => {
    await openApp('/habit/' + habitId);
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    expect(
      screen.getByRole('header', { name: 'Excluir Leitura?' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Todo o histórico deste hábito será removido. Esta ação não pode ser desfeita.',
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('header', { name: 'Histórico' })).toBeOnTheScreen();
    expect(await repository.findById(habitId)).not.toBeNull();
    expect(await repository.getCompletions(habitId)).toHaveLength(4);
  });

  it('confirms deletion, relies on cascade and returns to an updated Home', async () => {
    await openApp();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Ver detalhes de Leitura' }),
    );
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    expect(
      await screen.findByRole('header', { name: 'Meus hábitos' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Nenhum hábito ainda')).toBeOnTheScreen();
    expect(await repository.findById(habitId)).toBeNull();
    expect(await repository.getCompletions(habitId)).toHaveLength(0);
  });

  it('preserves data on delete failure and allows retry from a direct link', async () => {
    await openApp('/habit/' + habitId);
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'delete')
      .mockRejectedValueOnce(new Error('delete failed'));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir o hábito. Tente novamente.',
    );
    expect(await repository.getCompletions(habitId)).toHaveLength(4);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    expect(await screen.findByText('Meus hábitos')).toBeOnTheScreen();
    expect(await repository.findById(habitId)).toBeNull();
  });

  it('waits for an in-flight completion before deleting and prevents duplicate submissions', async () => {
    let release!: () => void;
    const gate = new Promise<void>((done) => {
      release = done;
    });
    const persist = repository.toggleCompletion.bind(repository);
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
      .mockImplementationOnce((id, date) => gate.then(() => persist(id, date)));
    const remove = jest.spyOn(SQLiteHabitRepository.prototype, 'delete');
    await openApp('/habit/' + habitId);
    await screen.findByRole('header', { name: 'Histórico' });
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /^Leitura, 3 de outubro/ }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Opções do hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir hábito' }),
    );
    expect(screen.getByRole('button', { name: 'Excluindo…' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluindo…' }));
    expect(remove).not.toHaveBeenCalled();
    await act(async () => release());
    expect(await screen.findByText('Meus hábitos')).toBeOnTheScreen();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(await repository.getCompletions(habitId)).toHaveLength(0);
  });
});
