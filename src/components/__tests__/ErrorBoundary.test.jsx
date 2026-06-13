import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../common/ErrorBoundary';

vi.mock('../../utils/errorLogger', () => ({
  logError: vi.fn(),
  persistErrors: vi.fn(),
}));

vi.mock('../../utils/securityLogger', () => ({
  logSecurityEvent: vi.fn(),
}));

import { logError } from '../../utils/errorLogger';

const ThrowError = () => {
  throw new Error('Test error');
};

const SafeComponent = () => <div>Safe content</div>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('catches errors and shows page fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('System Crash Prevented')).toBeInTheDocument();
    expect(screen.getByText(/error reference/i)).toBeInTheDocument();
  });

  it('displays the error message in the fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Error: Test error/, { selector: '.eb-error-text' })).toBeInTheDocument();
  });

  it('shows section fallback for level="section"', () => {
    render(
      <ErrorBoundary level="section" label="Test Section">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/test section failed to load/i)).toBeInTheDocument();
  });

  it('shows feature fallback for level="feature"', () => {
    render(
      <ErrorBoundary level="feature" label="Test Feature">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/test feature failed to load/i)).toBeInTheDocument();
  });

  it('returns null in silent mode', () => {
    const { container } = render(
      <ErrorBoundary level="section" silent>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders custom fallback element', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('renders custom fallback function with error and retry', () => {
    const fallbackFn = vi.fn((error, retry) => (
      <div>
        <p>{error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    ));
    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Retry')).toBeInTheDocument();
  });

  it('calls logError on catch', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object),
      expect.objectContaining({ level: 'page' })
    );
  });

  it('provides Try Again button in page fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('provides Reload Page button in page fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /reload the page/i })).toBeInTheDocument();
  });

  it('toggles diagnostics panel', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const toggle = screen.getByText('View Diagnostics');
    fireEvent.click(toggle);
    expect(screen.getByText('Hide Diagnostics')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Hide Diagnostics'));
    expect(screen.getByText('View Diagnostics')).toBeInTheDocument();
  });
});
