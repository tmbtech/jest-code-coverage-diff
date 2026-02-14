import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
  });

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByLabelText('increment'));
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
  });

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByLabelText('decrement'));
    expect(screen.getByText('Counter: -1')).toBeInTheDocument();
  });

  it('resets count to 0 when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByLabelText('increment'));
    await user.click(screen.getByLabelText('increment'));
    await user.click(screen.getByLabelText('reset'));

    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
  });
});
