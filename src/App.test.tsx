import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders main heading', () => {
    render(<App />);
    expect(screen.getByText('Jest Code Coverage Diff Demo')).toBeInTheDocument();
  });

  it('renders Counter component', () => {
    render(<App />);
    expect(screen.getByText(/Counter:/)).toBeInTheDocument();
  });

  it('renders Calculator component', () => {
    render(<App />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
  });

  it('renders footer with coverage diff information', () => {
    render(<App />);
    expect(screen.getByText(/GitHub Actions workflow/)).toBeInTheDocument();
  });
});
