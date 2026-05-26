import React from "react";

import "./ErrorBoundary.css";

import { logError } from "../../utils/errorLogger";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
      copied: false,
    };

    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleCopyError = this.handleCopyError.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `EVT-${Date.now().toString(36).toUpperCase()}`,
      copied: false,
    };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, {
      ...errorInfo,
      boundary: this.props.boundaryName || "Application",
      errorId: this.state.errorId,
    });

    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    if (!this.state.hasError) {
      return;
    }

    const previousResetKeys = prevProps.resetKeys || [];
    const resetKeys = this.props.resetKeys || [];
    const shouldReset = resetKeys.some((key, index) => key !== previousResetKeys[index]);

    if (shouldReset) {
      this.handleReset();
    }
  }

  handleReset() {
    if (this.state.retryCount >= 3) {
      window.location.reload();
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false,
      retryCount: prevState.retryCount + 1,
    }));
  }

  handleReload() {
    window.location.reload();
  }

  async handleCopyError() {
    if (!this.state.error || !navigator.clipboard) {
      return;
    }

    const errorReport = [
      `Error ID: ${this.state.errorId}`,
      `Boundary: ${this.props.boundaryName || "Application"}`,
      this.state.error.toString(),
      this.state.errorInfo?.componentStack || "",
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(errorReport);
      this.setState({ copied: true });
    } catch (_) {
      this.setState({ copied: false });
    }
  }

  render() {
    const variant = this.props.variant || "fullscreen";
    const boundaryName = this.props.boundaryName || "Application";

    if (this.state.hasError) {
      return (
        <div
          className={`eb-shell eb-${variant}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="eb-card">
            <div
              className="eb-icon-wrapper"
              aria-hidden="true"
            >
              <svg
                className="eb-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />

                <path
                  d="M32 18v18"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle
                  cx="32"
                  cy="44"
                  r="2.5"
                  fill="currentColor"
                />
              </svg>
            </div>

            <h1 className="eb-title">
              {this.props.title || "Something went wrong"}
            </h1>

            <p className="eb-message">
              {this.props.description ||
                `The ${boundaryName} area hit an unexpected runtime issue. You can retry this view, reload the app state, or return to a safe page.`}
            </p>

            <div className="eb-summary-window">
              <div>
                <span className="eb-summary-label">Boundary</span>
                <strong>{boundaryName}</strong>
              </div>
              <div>
                <span className="eb-summary-label">Error ID</span>
                <strong>{this.state.errorId}</strong>
              </div>
              <div>
                <span className="eb-summary-label">Recovery attempts</span>
                <strong>{this.state.retryCount} of 3</strong>
              </div>
            </div>

            <div className="eb-actions">
              <button
                className="eb-btn-primary"
                onClick={this.handleReload}
              >
                Reload App State
              </button>

              <button
                className="eb-btn-secondary"
                onClick={this.handleReset}
              >
                Try Again
              </button>

              {this.props.showHomeLink !== false && (
                <a className="eb-btn-secondary eb-link" href="/">
                  Return Home
                </a>
              )}

              <button
                className="eb-btn-copy"
                onClick={this.handleCopyError}
              >
                {this.state.copied ? "Copied" : "Copy Error"}
              </button>
            </div>

            {process.env
              .NODE_ENV !==
              "production" &&
              this.state
                .error && (
                <details className="eb-details">
                  <summary className="eb-details-summary">
                    Technical Details
                  </summary>

                  <pre className="eb-stack">
                    {this.state.error.toString()}
                    {
                      this
                        .state
                        .errorInfo
                        ?.componentStack
                    }
                  </pre>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props
      .children;
  }
}

export default GlobalErrorBoundary;
