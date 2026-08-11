import React from 'react';
import { render, screen } from '@testing-library/react';
import SellingFastBadge from './SellingFastBadge';

describe('SellingFastBadge', () => {
  it('renders with the provided message', () => {
    render(<SellingFastBadge message="Selling Fast!" />);
    expect(screen.getByText('Selling Fast!')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<SellingFastBadge message="Only 5 Tickets Left!" />);
    expect(screen.getByText('Only 5 Tickets Left!')).toBeInTheDocument();
  });

  it('includes lightning emoji', () => {
    render(<SellingFastBadge message="Selling Fast!" />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    render(<SellingFastBadge message="Test" className="custom-class" />);
    const badge = screen.getByText('Test');
    expect(badge).toHaveClass('custom-class');
  });

  it('has appropriate accessibility attributes', () => {
    render(<SellingFastBadge message="Selling Fast!" />);
    const badge = screen.getByText('Selling Fast!');
    expect(badge.parentElement).toHaveAttribute('role', 'status');
    expect(badge.parentElement).toHaveAttribute('aria-live', 'polite');
  });
});