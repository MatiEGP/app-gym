import { render, screen } from '@testing-library/react-native';

import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('shows the app name', async () => {
    await render(<PlaceholderScreen />);

    expect(screen.getByText('App Gym')).toBeOnTheScreen();
  });
});
