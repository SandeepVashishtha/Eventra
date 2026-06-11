import { render, screen, fireEvent } from '@testing-library/react';
import EmptySearchState from '../EmptySearchState';

describe('EmptySearchState', () => {
  it('renders search query text', () => {
    render(<EmptySearchState query="react" />);
    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
    expect(screen.getByText(/react/i)).toBeInTheDocument();
  });

  it('renders without a query', () => {
    render(<EmptySearchState />);
    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    render(<EmptySearchState query="test" onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onClear is omitted', () => {
    render(<EmptySearchState query="test" />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    }).not.toThrow();
  });
});
