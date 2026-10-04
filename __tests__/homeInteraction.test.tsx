import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import HomeScreen from '../app/index';
import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { initializeDatabase } from '../src/database/database';
import { SQLiteHabitRepository } from '../src/features/habits/repository/SQLiteHabitRepository';
import { TestDatabase } from './support/TestDatabase';
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
function Home() {
  return (
    <HabitsProvider>
      <HomeScreen />
    </HabitsProvider>
  );
}

let mockDatabase: TestDatabase;
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => mockDatabase }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function day(number: number) {
  return screen.getByRole('checkbox', {
    name: new RegExp(`Corrida, ${number} de outubro`),
  });
}

describe('Home completion interaction', () => {
  let repository: SQLiteHabitRepository;
  let habitId: string;
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 1, 12));
    mockDatabase = new TestDatabase();
    await initializeDatabase(mockDatabase);
    repository = new SQLiteHabitRepository(mockDatabase);
    habitId = (await repository.create({ name: 'Corrida' })).id;
    jest.setSystemTime(new Date(2026, 9, 3, 12));
    jest.mocked(Haptics.impactAsync).mockClear();
  });
  afterEach(() => {
    mockDatabase.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('marks, unmarks and reloads persisted completions, with haptics only on completion', async () => {
    await render(<Home />);
    await screen.findByText('Corrida');
    await fireEvent.press(day(3));
    expect(day(3)).toBeChecked();
    expect(screen.getByText('1 conclusão')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(await repository.getCompletions(habitId)).toHaveLength(1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    await screen.unmount();
    await render(<Home />);
    await screen.findByText('Corrida');
    expect(day(3)).toBeChecked();
    await fireEvent.press(day(3));
    expect(day(3)).not.toBeChecked();
    expect(screen.getByText('0 conclusões')).toBeOnTheScreen();
    expect(screen.getByLabelText('0 dias seguidos')).toBeOnTheScreen();
    expect(await repository.getCompletions(habitId)).toHaveLength(0);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('recalculates streak when retroactive completion joins or breaks a run', async () => {
    for (const date of [
      '2026-09-28',
      '2026-09-29',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ])
      await repository.toggleCompletion(habitId, date);
    await render(<Home />);
    await screen.findByText('Corrida');
    expect(screen.getByLabelText('3 dias seguidos')).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole('checkbox', { name: /30 de setembro/ }),
    );
    expect(screen.getByLabelText('6 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('6 conclusões')).toBeOnTheScreen();
    await fireEvent.press(day(2));
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(screen.getByText('5 conclusões')).toBeOnTheScreen();
  });

  it('updates before persistence finishes, without disabling the date', async () => {
    const gate = deferred();
    const persist = repository.toggleCompletion.bind(repository);
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
      .mockImplementationOnce((id, date) =>
        gate.promise.then(() => persist(id, date)),
      );
    await render(<Home />);
    await screen.findByText('Corrida');
    await fireEvent.press(day(3));
    expect(day(3)).toBeChecked();
    expect(day(3)).not.toBeDisabled();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(await repository.getCompletions(habitId)).toHaveLength(0);
    await act(async () => gate.resolve());
    expect(await repository.getCompletions(habitId)).toHaveLength(1);
  });

  it('rolls back only the failed day, retaining successful concurrent edits', async () => {
    const gate = deferred();
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
      .mockImplementationOnce(() => gate.promise.then(() => true));
    await render(<Home />);
    await screen.findByText('Corrida');
    await fireEvent.press(day(3));
    await fireEvent.press(day(2));
    expect(screen.getByText('2 conclusões')).toBeOnTheScreen();
    await act(async () => gate.reject(new Error('write failed')));
    expect(day(3)).not.toBeChecked();
    expect(day(2)).toBeChecked();
    expect(screen.getByText('1 conclusão')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a conclusão. Tente novamente.',
    );
    await fireEvent.press(day(3));
    expect(day(3)).toBeChecked();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await repository.getCompletions(habitId)).toHaveLength(2);
  });

  it.each([2, 3])(
    'keeps the final intent after %i rapid taps on the same date',
    async (taps) => {
      const gate = deferred();
      const persist = repository.toggleCompletion.bind(repository);
      const toggle = jest
        .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
        .mockImplementationOnce((id, date) =>
          gate.promise.then(() => persist(id, date)),
        );
      await render(<Home />);
      await screen.findByText('Corrida');
      for (let index = 0; index < taps; index += 1)
        await fireEvent.press(day(3));
      expect(day(3).props.accessibilityState.checked).toBe(taps % 2 === 1);
      expect(toggle).toHaveBeenCalledTimes(1);
      await act(async () => gate.resolve());
      expect(day(3).props.accessibilityState.checked).toBe(taps % 2 === 1);
      expect(await repository.getCompletions(habitId)).toHaveLength(taps % 2);
      expect(toggle).toHaveBeenCalledTimes(taps === 2 ? 2 : 1);
    },
  );

  it('keeps the last confirmed state when a queued undo fails', async () => {
    const gate = deferred();
    const persist = repository.toggleCompletion.bind(repository);
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'toggleCompletion')
      .mockImplementationOnce((id, date) =>
        gate.promise.then(() => persist(id, date)),
      )
      .mockRejectedValueOnce(new Error('undo failed'));
    await render(<Home />);
    await screen.findByText('Corrida');
    await fireEvent.press(day(3));
    await fireEvent.press(day(3));
    await act(async () => gate.resolve());
    expect(day(3)).toBeChecked();
    expect(await repository.getCompletions(habitId)).toHaveLength(1);
    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });

  it('blocks pre-creation days while leaving today editable for a new habit', async () => {
    await repository.delete(habitId);
    habitId = (await repository.create({ name: 'Corrida' })).id;
    const toggle = jest.spyOn(
      SQLiteHabitRepository.prototype,
      'toggleCompletion',
    );
    await render(<Home />);
    await screen.findByText('Corrida');
    expect(screen.getAllByRole('checkbox', { disabled: true })).toHaveLength(5);
    expect(day(3)).not.toBeDisabled();
    await fireEvent.press(day(2));
    expect(toggle).not.toHaveBeenCalled();
  });

  it('does not fail persistence when haptics are unavailable', async () => {
    jest
      .mocked(Haptics.impactAsync)
      .mockRejectedValueOnce(new Error('unsupported'));
    await render(<Home />);
    await screen.findByText('Corrida');
    await fireEvent.press(day(3));
    expect(day(3)).toBeChecked();
    expect(await repository.getCompletions(habitId)).toHaveLength(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
