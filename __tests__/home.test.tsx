import { render, screen, within } from '@testing-library/react-native';
import Home from '../app/index';

describe('Static Home', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 3, 12));
  });
  afterEach(() => jest.useRealTimers());

  it('renders the title, local date and three mock habits with six days each', async () => {
    await render(<Home />);
    expect(
      screen.getByRole('header', { name: 'Meus hábitos' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('3 de outubro')).toBeOnTheScreen();
    for (const [id, name] of [
      ['academia', 'Academia'],
      ['leitura', 'Leitura'],
      ['meditacao', 'Meditação'],
    ]) {
      const card = within(screen.getByTestId(`habit-${id}`));
      expect(card.getByRole('header', { name })).toBeOnTheScreen();
      expect(card.getAllByRole('checkbox', { disabled: true })).toHaveLength(6);
    }
    expect(
      screen.getByRole('button', { name: 'Criar hábito', disabled: true }),
    ).toBeDisabled();
  });

  it.each([
    [
      new Date(2026, 9, 2, 12),
      '27 de setembro de 2026',
      '2 de outubro de 2026',
    ],
    [
      new Date(2027, 0, 2, 12),
      '28 de dezembro de 2026',
      '2 de janeiro de 2027',
    ],
  ])(
    'keeps six chronological dates across boundaries (%s)',
    async (now, first, last) => {
      jest.setSystemTime(now);
      await render(<Home />);
      const days = within(screen.getByTestId('habit-academia')).getAllByRole(
        'checkbox',
      );
      expect(days).toHaveLength(6);
      expect(days[0].props.accessibilityLabel).toContain(first);
      expect(days[5].props.accessibilityLabel).toContain(`${last}, hoje`);
    },
  );
});
