import { render, screen } from '@testing-library/react-native';
import { DayStatus } from '../src/features/habits/components/DayStatus';
import { HabitCard } from '../src/features/habits/components/HabitCard';
import { StreakIndicator } from '../src/features/habits/components/StreakIndicator';

describe('StreakIndicator', () => {
  it.each([
    [0, 'dias seguidos'],
    [1, 'dia seguido'],
    [2, 'dias seguidos'],
    [14, 'dias seguidos'],
  ])('renders %i %s', async (value, label) => {
    await render(<StreakIndicator value={value} />);
    expect(screen.getByLabelText(`${value} ${label}`)).toBeOnTheScreen();
    expect(screen.getByText(String(value))).toBeOnTheScreen();
  });
});

describe('DayStatus', () => {
  it.each([
    [false, '2026-10-02', 'Academia, 2 de outubro de 2026, não concluído'],
    [true, '2026-10-02', 'Academia, 2 de outubro de 2026, concluído'],
    [
      false,
      '2026-10-03',
      'Academia, 3 de outubro de 2026, hoje, não concluído',
    ],
    [true, '2026-10-03', 'Academia, 3 de outubro de 2026, hoje, concluído'],
  ])('describes completed=%s on %s', async (completed, date, label) => {
    await render(
      <DayStatus
        date={date}
        today="2026-10-03"
        completed={completed}
        habitName="Academia"
      />,
    );
    const day = screen.getByRole('checkbox', {
      name: label,
      checked: completed,
      disabled: true,
    });
    expect(day).toBeOnTheScreen();
    expect(screen.queryByText('✓')).toBeNull();
  });
});

describe('HabitCard', () => {
  it('renders the name, current streak, total and exactly six days', async () => {
    await render(
      <HabitCard
        today="2026-10-03"
        habit={{
          id: 'reading',
          name: 'Leitura',
          createdAt: '2026-09-01T12:00:00Z',
          updatedAt: '2026-09-01T12:00:00Z',
          completedDates: ['2026-10-03'],
        }}
      />,
    );
    expect(screen.getByRole('header', { name: 'Leitura' })).toBeOnTheScreen();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(screen.getByText('1 conclusão')).toBeOnTheScreen();
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(1);
    expect(screen.getAllByRole('checkbox', { checked: false })).toHaveLength(5);
  });
});
