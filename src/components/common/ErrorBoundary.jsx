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
    };

    this.recoveryTimeout =
      null;

    this.handleReset =
      this.handleReset.bind(
        this
      );

    this.handleReload =
      this.handleReload.bind(
        this
      );

    this.handleCopyError =
      this.handleCopyError.bind(
        this
      );
  }

  // Catch Rendering Errors
  static getDerivedStateFromError(
    error
  ) {
    return {
      hasError: true,
      error,
      errorId:
        Date.now().toString(
          36
        ),
    };
  }

  // Log Errors
  componentDidCatch(
    error,
    errorInfo
  ) {
    logError(
      error,
      errorInfo
    );

    this.setState({
      errorInfo,
    });

    // Intelligent Recovery
    this.recoveryTimeout =
      setTimeout(() => {
        this.handleReset();
      }, 10000);
  }

  // Cleanup
  componentWillUnmount() {
    if (
      this.recoveryTimeout
    ) {
      clearTimeout(
        this.recoveryTimeout
      );
    }
  }

  // Retry Rendering
  handleReset() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
      this.recoveryTimeout = null;
    }

    if (
      this.state.retryCount >=
      3
    ) {
      window.location.reload();

      return;
    }

    this.setState(
      (prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount:
          prevState.retryCount +
          1,
      })
    );
  }

  // Force Reload
  handleReload() {
    window.location.reload();
  }

  // Copy Error
  handleCopyError() {
    if (
      this.state.error
    ) {
      navigator.clipboard.writeText(
        this.state.error.toString()
      );
    }
  }

  render() {
    const variant =
      this.props.variant ||
      "fullscreen";

    if (
      this.state.hasError
    ) {
      return (
        <div
          className={`
            eb-overlay
            eb-${variant}
          `}
          role="alert"
          aria-live="assertive"
        >
          <div className="eb-card">
            {/* Icon */}
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

            {/* Title */}
            <h1 className="eb-title">
              Oops! Something
              went wrong.
            </h1>

            {/* Description */}
            <p className="eb-message">
              An unexpected
              runtime error
              interrupted the
              application.
              Recovery options
              are available
              below.
            </p>

            {/* Error ID */}
            <p className="eb-error-id">
              Error ID:
              {" "}
              {
                this.state
                  .errorId
              }
            </p>

            {/* Actions */}
            <div className="eb-actions">
              <button
                className="eb-btn-primary"
                onClick={
                  this
                    .handleReload
                }
              >
                Reload Page
              </button>

              <button
                className="eb-btn-secondary"
                onClick={
                  this
                    .handleReset
                }
              >
                Try Again
              </button>

              <button
                className="eb-btn-copy"
                onClick={
                  this
                    .handleCopyError
                }
              >
                Copy Error
              </button>
            </div>

            {/* Development Details */}
            {process.env
              .NODE_ENV !==
              "production" &&
              this.state
                .error && (
                <details className="eb-details">
                  <summary className="eb-details-summary">
                    Technical
                    Details
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