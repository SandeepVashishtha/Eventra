import React from 'react';
import './ErrorBoundary.css';

/**
 * GlobalErrorBoundary
 *
 * Wraps the entire React component tree to catch any unhandled runtime
 * rendering exceptions. Without this, a single child component crash
 * would unmount the entire app, presenting a blank "white screen of death".
 *
 * Usage:
 *   <GlobalErrorBoundary>
 *     <App />
 *   </GlobalErrorBoundary>
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.handleReset = this.handleReset.bind(this);
  }

  /**
   * getDerivedStateFromError
   * Called during the render phase when a descendant throws.
   * Updates state so the next render shows the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch
   * Called after the error has been thrown and captured.
   * Logs the error details for debugging / future centralised logging.
   */
  componentDidCatch(error, errorInfo) {
    // Log safely — avoids crashing the boundary itself
    try {
      console.error('[GlobalErrorBoundary] Uncaught rendering error:', error);
      console.error('[GlobalErrorBoundary] Component stack:', errorInfo.componentStack);
    } catch (_) {
      // Silently ignore any logging failures
    }

    this.setState({ errorInfo });

    // ─── Future integration point ────────────────────────────────────────────
    // Send to a centralised error monitoring service (e.g. Sentry, Datadog):
    //
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
    // ─────────────────────────────────────────────────────────────────────────
  }

  /** Resets error state, allowing React to re-render the child tree. */
  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb-overlay" role="alert" aria-live="assertive">
          <div className="eb-card">
            {/* Branded icon */}
            <div className="eb-icon-wrapper" aria-hidden="true">
              <svg
                className="eb-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
                <path
                  d="M32 18v18"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="44" r="2.5" fill="currentColor" />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="eb-title">Oops! Something went wrong.</h1>

            {/* Sub-message */}
            <p className="eb-message">
              An unexpected error occurred and the page could not be displayed.
              This has been logged and our team will look into it.
            </p>

            {/* Action buttons */}
            <div className="eb-actions">
              <button
                id="eb-refresh-btn"
                className="eb-btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                id="eb-retry-btn"
                className="eb-btn-secondary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </div>

            {/* Collapsible technical detail — only shown in non-production */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="eb-details">
                <summary className="eb-details-summary">Technical Details (dev only)</summary>
                <pre className="eb-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
