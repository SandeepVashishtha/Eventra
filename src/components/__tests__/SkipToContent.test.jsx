import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SkipToContent from '../accessibility/SkipToContent';

describe('SkipToContent', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main-content"></main>';
  });

  it('renders skip link with default target', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('renders with custom targetId', () => {
    render(<SkipToContent targetId="custom-content" />);
    expect(screen.getByText('Skip to main content')).toHaveAttribute('href', '#custom-content');
  });

  it('focuses target element on click', async () => {
    render(<SkipToContent />);
    const target = document.getElementById('main-content');

    fireEvent.click(screen.getByText('Skip to main content'));

    await waitFor(() => {
      expect(target).toHaveAttribute('tabindex', '-1');
    });
  });

  it('cleans up tabindex on blur', async () => {
    render(<SkipToContent />);
    const target = document.getElementById('main-content');

    fireEvent.click(screen.getByText('Skip to main content'));

    await waitFor(() => {
      expect(target).toHaveAttribute('tabindex', '-1');
    });

    fireEvent.blur(target);
    expect(target).not.toHaveAttribute('tabindex');
  });

  it('handles missing target element gracefully', () => {
    document.body.innerHTML = '';
    render(<SkipToContent />);
    expect(() => {
      fireEvent.click(screen.getByText('Skip to main content'));
    }).not.toThrow();
  });
});
