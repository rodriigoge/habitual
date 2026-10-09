import { fireEvent, render, screen } from '@testing-library/react-native';
import { HabitCalendar } from '../src/features/habits/components/HabitCalendar';

const habit = {
  id: 'one',
  name: 'Ler',
  createdAt: '2026-09-10T12:00:00Z',
  updatedAt: '2026-09-10T12:00:00Z',
  completedDates: ['2026-10-02', '2026-10-03'],
};
describe('Habit Calendar', () => {
  it('renders completion, today and future states and bounds month navigation', async () => {
    await render(
      <HabitCalendar
        habit={habit}
        today="2026-10-03"
        onToggleDay={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('header', { name: 'outubro de 2026' }),
    ).toBeOnTheScreen();
    expect(screen.getAllByRole('checkbox')).toHaveLength(31);
    expect(
      screen.getByRole('checkbox', {
        name: /3 de outubro.*hoje/,
        checked: true,
      }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole('checkbox', {
        name: /^Ler, 4 de outubro/,
        disabled: true,
      }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mês seguinte' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(
      screen.getByRole('header', { name: 'setembro de 2026' }),
    ).toBeOnTheScreen();
    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
    expect(
      screen.getByRole('checkbox', {
        name: /^Ler, 9 de setembro/,
        disabled: true,
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', {
        name: /^Ler, 10 de setembro/,
        disabled: false,
      }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Mês seguinte' }));
    expect(
      screen.getByRole('header', { name: 'outubro de 2026' }),
    ).toBeOnTheScreen();
  });
  it('handles a single creation month and a year transition', async () => {
    await render(
      <HabitCalendar
        habit={{ ...habit, createdAt: '2026-12-31T12:00:00Z' }}
        today="2027-01-02"
        onToggleDay={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(
      screen.getByRole('header', { name: 'dezembro de 2026' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled();
    expect(screen.getAllByRole('checkbox', { disabled: false })).toHaveLength(
      1,
    );
  });
});
