import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calculator } from './Calculator';

describe('Calculator', () => {
  it('renders calculator component', () => {
    render(<Calculator />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
  });

  it('performs addition correctly', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const num1Input = screen.getByLabelText('First number');
    const num2Input = screen.getByLabelText('Second number');
    const calculateButton = screen.getByText('Calculate');

    await user.type(num1Input, '5');
    await user.type(num2Input, '3');
    await user.click(calculateButton);

    expect(screen.getByTestId('result')).toHaveTextContent('Result: 8');
  });

  it('performs subtraction correctly', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const num1Input = screen.getByLabelText('First number');
    const num2Input = screen.getByLabelText('Second number');
    const operationSelect = screen.getByLabelText('Operation');
    const calculateButton = screen.getByText('Calculate');

    await user.type(num1Input, '10');
    await user.type(num2Input, '4');
    await user.selectOptions(operationSelect, 'subtract');
    await user.click(calculateButton);

    expect(screen.getByTestId('result')).toHaveTextContent('Result: 6');
  });

  it('shows error for invalid input', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const calculateButton = screen.getByText('Calculate');
    await user.click(calculateButton);

    expect(screen.getByTestId('error')).toHaveTextContent('Please enter valid numbers');
  });

  it('shows error for division by zero', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const num1Input = screen.getByLabelText('First number');
    const num2Input = screen.getByLabelText('Second number');
    const operationSelect = screen.getByLabelText('Operation');
    const calculateButton = screen.getByText('Calculate');

    await user.type(num1Input, '10');
    await user.type(num2Input, '0');
    await user.selectOptions(operationSelect, 'divide');
    await user.click(calculateButton);

    expect(screen.getByTestId('error')).toHaveTextContent('Cannot divide by zero');
  });

  // Intentionally incomplete coverage - multiply and divide operations not fully tested
  // This demonstrates how coverage diff shows when new tests are added
});
