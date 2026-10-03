import { render, screen } from '@testing-library/react-native';

import Home from '../app/index';

describe('Bootstrap Home', () => {
  it('renders the temporary Home', async () => {
    await render(<Home />);

    expect(
      screen.getByRole('header', { name: 'Habit Tracker' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('App running')).toBeOnTheScreen();
  });
});
