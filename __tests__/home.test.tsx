import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import Home from '../app/index';
import { initializeDatabase } from '../src/database/database';
import { SQLiteHabitRepository } from '../src/features/habits/repository/SQLiteHabitRepository';
import { TestDatabase } from './support/TestDatabase';

let mockDatabase: TestDatabase;
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => mockDatabase }));

describe('Home with persisted data', () => {
  let repository: SQLiteHabitRepository;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 1, 12));
    mockDatabase = new TestDatabase();
    initializeDatabase(mockDatabase);
    repository = new SQLiteHabitRepository(mockDatabase);
  });
  afterEach(() => {
    mockDatabase.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('loads stored habits in creation order and derives metrics from full history', async () => {
    const first = await repository.create({ name: 'Corrida' });
    await repository.create({ name: 'Estudo' });
    jest.setSystemTime(new Date(2026, 9, 3, 12));
    for (const date of ['2026-09-10', '2026-10-01', '2026-10-02'])
      await repository.toggleCompletion(first.id, date);
    await render(<Home />);
    expect(await screen.findByText('Corrida')).toBeOnTheScreen();
    expect(screen.getByText('3 de outubro')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 dias seguidos')).toBeOnTheScreen();
    expect(screen.getByText('3 conclusões')).toBeOnTheScreen();
    expect(
      screen.getAllByRole('header').map((item) => item.props.children),
    ).toEqual(['Meus hábitos', 'Corrida', 'Estudo']);
    const days = within(screen.getByTestId(`habit-${first.id}`)).getAllByRole(
      'checkbox',
    );
    expect(days).toHaveLength(6);
    expect(days[0].props.accessibilityLabel).toContain(
      '28 de setembro de 2026',
    );
    expect(days[5].props.accessibilityLabel).toContain(
      '3 de outubro de 2026, hoje',
    );
  });

  it('keeps the year boundary in the six-day window', async () => {
    const habit = await repository.create({ name: 'Leitura' });
    jest.setSystemTime(new Date(2027, 0, 2, 12));
    await render(<Home />);
    await screen.findByText('Leitura');
    const days = within(screen.getByTestId(`habit-${habit.id}`)).getAllByRole(
      'checkbox',
    );
    expect(days).toHaveLength(6);
    expect(days[0].props.accessibilityLabel).toContain(
      '28 de dezembro de 2026',
    );
    expect(days[5].props.accessibilityLabel).toContain(
      '2 de janeiro de 2027, hoje',
    );
  });

  it('shows loading until the repository resolves', async () => {
    let resolve!: (value: []) => void;
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'findAll')
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    await render(<Home />);
    expect(screen.getByText('Carregando hábitos…')).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum hábito ainda')).toBeNull();
    await act(async () => resolve([]));
    expect(screen.queryByText('Carregando hábitos…')).toBeNull();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('shows a recoverable loading error without fictional habits', async () => {
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'findAll')
      .mockRejectedValueOnce(new Error('read failed'));
    await render(<Home />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar seus hábitos. Tente novamente.',
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByText('Nenhum hábito ainda')).toBeNull();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('opens the sheet, rejects blank names and creates a trimmed persisted habit', async () => {
    await repository.create({ name: 'Existente' });
    await render(<Home />);
    await screen.findByText('Existente');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(
      screen.getByRole('header', { name: 'Novo hábito' }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Nome do hábito').props.autoFocus).toBe(true);
    expect(screen.getByRole('button', { name: 'Criar hábito' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Nome do hábito'), '   ');
    expect(screen.getByRole('button', { name: 'Criar hábito' })).toBeDisabled();
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      '  Caminhar  ',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(await screen.findByText('Caminhar')).toBeOnTheScreen();
    expect(screen.queryByText('Novo hábito')).toBeNull();
    expect((await repository.findAll()).map((habit) => habit.name)).toEqual([
      'Existente',
      'Caminhar',
    ]);
    await screen.unmount();
    await render(<Home />);
    expect(await screen.findByText('Caminhar')).toBeOnTheScreen();
  });

  it('keeps the name and offers retry after creation fails', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      'Leitura',
    );
    jest
      .spyOn(SQLiteHabitRepository.prototype, 'create')
      .mockRejectedValueOnce(new Error('write failed'));
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível criar o hábito. Tente novamente.',
    );
    expect(screen.getByLabelText('Nome do hábito')).toHaveDisplayValue(
      'Leitura',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(await screen.findByText('Leitura')).toBeOnTheScreen();
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('does not duplicate creation while a submission is pending', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    await fireEvent.changeText(screen.getByLabelText('Nome do hábito'), 'Yoga');
    const saved = await repository.create({ name: 'Yoga' });
    let resolve!: (value: typeof saved) => void;
    const create = jest
      .spyOn(SQLiteHabitRepository.prototype, 'create')
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    await fireEvent(screen.getByLabelText('Nome do hábito'), 'submitEditing');
    expect(screen.getByRole('button', { name: 'Criando…' })).toBeDisabled();
    expect(create).toHaveBeenCalledTimes(1);
    await act(async () => resolve(saved));
    expect(await screen.findByText('Yoga')).toBeOnTheScreen();
  });

  it('cancels without saving and starts the next form empty', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      'Rascunho',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(await repository.findAll()).toHaveLength(0);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(screen.getByLabelText('Nome do hábito')).toHaveDisplayValue('');
  });

  it('shows an intentional empty state and transitions to the first persisted habit', async () => {
    await render(<Home />);
    expect(
      await screen.findByRole('header', { name: 'Nenhum hábito ainda' }),
    ).toBeOnTheScreen();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByText('Academia')).toBeNull();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Criar primeiro hábito' }),
    );
    expect(
      screen.getByRole('header', { name: 'Novo hábito' }),
    ).toBeOnTheScreen();
    await fireEvent.changeText(
      screen.getByLabelText('Nome do hábito'),
      'Alongamento',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Criar hábito' }));
    expect(
      await screen.findByRole('header', { name: 'Alongamento' }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum hábito ainda')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Criar primeiro hábito' }),
    ).toBeNull();
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    expect(screen.getAllByRole('checkbox', { disabled: true })).toHaveLength(5);
    expect((await repository.findAll())[0].name).toBe('Alongamento');
  });
});
