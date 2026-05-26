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

    this.recoveryTimeout = null;

    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleCopyReport = this.handleCopyReport.bind(this);
    this.handleClearCache = this.handleClearCache.bind(this);
  }

  // Catch Rendering Errors
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36).toUpperCase(),
    };
  }

  // Log Errors
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Intelligent Auto-Recovery (retry once after crash)
    if (this.state.retryCount < 1) {
      this.recoveryTimeout = setTimeout(() => {
        this.handleReset();
      }, 8000);
    }
  }

  // Cleanup
  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  // Retry Rendering
  handleReset() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
      this.recoveryTimeout = null;
    }

    if (this.state.retryCount >= 3) {
      window.location.reload();
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  }

  // Force Reload
  handleReload() {
    window.location.reload();
  }

  // Clear Client Storage Cache
  handleClearCache() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear browser cache:", e);
    }
  }

  // Get browser diagnostics and data state
  getDiagnostics() {
    const metadata = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine ? "Online" : "Offline",
      time: new Date().toISOString(),
    };

    const localStorageSnapshot = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        localStorageSnapshot[key] = val && val.length > 500 ? val.substring(0, 500) + "..." : val;
      }
    } catch (e) {
      localStorageSnapshot.error = "Failed to access localStorage: " + e.message;
    }

    return {
      metadata,
      localStorageSnapshot,
    };
  }

  // Copy comprehensive diagnostics report
  handleCopyReport() {
    const { metadata, localStorageSnapshot } = this.getDiagnostics();
    const errorString = this.state.error ? this.state.error.toString() : "Unknown Error";
    const stack = this.state.error?.stack || "No stack trace available";
    const componentStack = this.state.errorInfo?.componentStack || "No component stack available";

    const reportText = `================ EVENTRA DIAGNOSTIC REPORT ================
Timestamp: ${metadata.time}
Online Status: ${metadata.online}
Error ID: ${this.state.errorId || "N/A"}

[ERROR]
${errorString}

[COMPONENT STACK]
${componentStack}

[STACK TRACE]
${stack}

[BROWSER METADATA]
User Agent: ${metadata.userAgent}
Platform: ${metadata.platform}
Language: ${metadata.language}
Screen Resolution: ${metadata.screenResolution}
Window Size: ${metadata.windowSize}

[LOCAL STORAGE SNAPSHOT (TRUNCATED)]
${JSON.stringify(localStorageSnapshot, null, 2)}
===========================================================`;

    navigator.clipboard
      .writeText(reportText)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy report:", err);
      });
  }

  render() {
    const variant = this.props.variant || "fullscreen";

    if (this.state.hasError) {
      const { metadata, localStorageSnapshot } = this.getDiagnostics();

      return (
        <div className={`eb-overlay eb-${variant}`} role="alert" aria-live="assertive">
          <div className="eb-card">
            {/* Glassmorphic Glow Elements */}
            <div className="eb-glow-1"></div>
            <div className="eb-glow-2"></div>

            {/* Icon */}
            <div className="eb-icon-wrapper" aria-hidden="true">
              <svg
                className="eb-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V14M12 17.5M12 3L2 21H22L12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="eb-title">System Crash Prevented</h1>

            {/* Description */}
            <p className="eb-message">
              Eventra encountered an unexpected crash. The issue has been intercepted and logged. 
              You can try reloading, resetting your local cache, or copying the diagnostic report below to report this issue.
            </p>

            {/* Error ID */}
            {this.state.errorId && (
              <p className="eb-error-id">
                Error Reference ID: <code>{this.state.errorId}</code>
              </p>
            )}

            {/* Actions */}
            <div className="eb-actions">
              <button className="eb-btn-primary" onClick={this.handleReload}>
                Reload Page
              </button>

              <button className="eb-btn-secondary" onClick={this.handleReset}>
                Try Again
              </button>

              <button className="eb-btn-reset-cache" onClick={this.handleClearCache}>
                Reset Cache
              </button>

              <button className="eb-btn-copy-report" onClick={this.handleCopyReport}>
                {this.state.copied ? "✓ Copied Report" : "📋 Copy Diagnostic Report"}
              </button>
            </div>

            {/* Diagnostic Details */}
            <details className="eb-details">
              <summary className="eb-details-summary">
                🔍 View Diagnostics
              </summary>
              <div className="eb-diagnostics-content">
                <div className="eb-diagnostic-section">
                  <h4 className="eb-section-title">Browser Metadata</h4>
                  <div className="eb-meta-grid">
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">User Agent:</span>
                      <span className="eb-meta-value">{metadata.userAgent}</span>
                    </div>
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">Platform:</span>
                      <span className="eb-meta-value">{metadata.platform}</span>
                    </div>
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">Language:</span>
                      <span className="eb-meta-value">{metadata.language}</span>
                    </div>
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">Screen:</span>
                      <span className="eb-meta-value">{metadata.screenResolution}</span>
                    </div>
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">Window:</span>
                      <span className="eb-meta-value">{metadata.windowSize}</span>
                    </div>
                    <div className="eb-meta-item">
                      <span className="eb-meta-label">Status:</span>
                      <span className="eb-meta-value">{metadata.online}</span>
                    </div>
                  </div>
                </div>

                <div className="eb-diagnostic-section">
                  <h4 className="eb-section-title">Error Stack Trace</h4>
                  <pre className="eb-stack">
                    {this.state.error?.toString()}
                    {"\n\n"}
                    {this.state.error?.stack}
                    {"\n\n"}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>

                <div className="eb-diagnostic-section">
                  <h4 className="eb-section-title">localStorage Snapshot</h4>
                  <pre className="eb-stack font-mono">
                    {JSON.stringify(localStorageSnapshot, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;