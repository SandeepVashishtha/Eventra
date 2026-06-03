import React from "react";
import "./ErrorBoundary.css";
import { logError } from "../../utils/errorLogger";
import {
  generateErrorId,
  attemptStateRecovery,
  saveAppStateSnapshot,
  persistErrorLog,
  buildDiagnosticReport,
} from "../../utils/diagnosticUtils";

// ── Component ─────────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false,
      showDiagnostics: false,
      retryCount: 0,
      isRecovering: false,
      recoveryMessage: "",
    };

    // Attempt to recover state on mount
    this.hasRecoveredState = attemptStateRecovery();
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId ?? generateErrorId();
    this.setState({ errorInfo, errorId });
    persistErrorLog(errorId, error, errorInfo);

    try {
      logError(error, errorInfo);
    } catch (_) { }

    console.error("Captured by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ isRecovering: true, recoveryMessage: "Reloading page..." });
    saveAppStateSnapshot();
    setTimeout(() => window.location.reload(), 300);
  };

  handleTryAgain = () => {
    const { retryCount } = this.state;
    if (retryCount >= 3) {
      this.handleReload();
      return;
    }
    this.setState({
      isRecovering: true,
      recoveryMessage: "Attempting recovery...",
    });
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        isRecovering: false,
        recoveryMessage: "",
        retryCount: retryCount + 1,
      });
    }, 500);
  };

  handleResetCache = () => {
    this.setState({ isRecovering: true, recoveryMessage: "Clearing cache..." });
    saveAppStateSnapshot();
    try {
      const preserved = {};
      ["theme", "cursor", "eventra_user_prefs"].forEach((key) => {
        const val = localStorage.getItem(key);
        if (val) preserved[key] = val;
      });
      localStorage.clear();
      Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
    } catch (_) {
      localStorage.clear();
    }
    setTimeout(() => window.location.reload(), 300);
  };

  handleCopyReport = () => {
    const { error, errorInfo, errorId } = this.state;
    const report = buildDiagnosticReport(errorId, error, errorInfo);

    navigator.clipboard
      .writeText(report)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      })
      .catch(() => {
        // Clipboard API failed — fallback: open in new tab
        try {
          const blob = new Blob([report], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (_) {}
      });
  };

  toggleDiagnostics = () => {
    this.setState((prev) => ({ showDiagnostics: !prev.showDiagnostics }));
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      error,
      errorInfo,
      errorId,
      copied,
      showDiagnostics,
      retryCount,
      isRecovering,
      recoveryMessage,
    } = this.state;
    const tooManyRetries = retryCount >= 3;

    const lsSnapshot = (() => {
      try {
        const snap = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password")) {
            snap[k] = localStorage.getItem(k)?.slice(0, 200);
          }
        }
        return JSON.stringify(snap, null, 2);
      } catch (_) {
        return "{}";
      }
    })();

    return (
      <div
        className="eb-overlay"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="eb-title"
        aria-describedby="eb-description"
        aria-busy={isRecovering}
      >
        {/* Animated background glows */}
        <div className="eb-bg-glow eb-bg-glow--1" aria-hidden="true" />
        <div className="eb-bg-glow eb-bg-glow--2" aria-hidden="true" />

        <div className={`eb-card ${isRecovering ? "eb-card--recovering" : ""}`} role="document">
          {/* Glow orbs inside card */}
          <div className="eb-glow-1" aria-hidden="true" />
          <div className="eb-glow-2" aria-hidden="true" />

          {/* ── Icon ── */}
          <div className="eb-icon-wrapper" aria-hidden="true">
            <svg
              className="eb-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          {/* ── Title ── */}
          <h1 className="eb-title" id="eb-title">
            System Crash Prevented
          </h1>
          <p className="eb-message" id="eb-description">
            Eventra encountered an unexpected crash. The issue has been intercepted and
            logged. You can try reloading, resetting your local cache, or copying the
            diagnostic report below to report this issue.
          </p>

          {/* ── Error Reference ID ── */}
          {errorId && (
            <p className="eb-error-id" aria-label={`Error reference: ${errorId}`}>
              Error Reference ID: <strong>{errorId}</strong>
            </p>
          )}

          {/* ── Error Message Box ── */}
          {error && (
            <div className="eb-error-message-box" role="region" aria-label="Error details">
              <span className="eb-error-label">Error</span>
              <p className="eb-error-text">{error.toString()}</p>
            </div>
          )}

          {/* ── Primary Action Buttons ── */}
          <div className="eb-actions">
            <button
              className="eb-btn-primary"
              onClick={this.handleReload}
              disabled={isRecovering}
              aria-label="Reload the page"
              title={isRecovering ? "Reloading..." : "Reload the page"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRecovering ? "Reloading..." : "Reload Page"}
            </button>

            <button
              className="eb-btn-secondary"
              onClick={this.handleTryAgain}
              disabled={tooManyRetries || isRecovering}
              aria-label={
                isRecovering
                  ? "Recovery in progress..."
                  : tooManyRetries
                  ? "Maximum retries reached — please reload"
                  : `Try again without reloading (attempt ${retryCount + 1} of 3)`
              }
              title={
                tooManyRetries
                  ? "Too many retries — reloading instead"
                  : isRecovering
                  ? "Recovering..."
                  : "Try again"
              }
            >
              {isRecovering ? (
                <>
                  <span className="eb-spinner" aria-hidden="true" />
                  Recovering...
                </>
              ) : tooManyRetries ? (
                "Reload Instead"
              ) : (
                "Try Again"
              )}
              {retryCount > 0 && !tooManyRetries && !isRecovering && (
                <span className="eb-retry-badge" aria-hidden="true">
                  {retryCount}/3
                </span>
              )}
            </button>
          </div>

          {/* ── Secondary Action Buttons ── */}
          <div className="eb-actions eb-actions--secondary">
            <button
              className="eb-btn-reset-cache"
              onClick={this.handleResetCache}
              disabled={isRecovering}
              aria-label="Reset app cache and reload. Your session will be preserved."
              title={isRecovering ? "Operation in progress..." : "Clear local cache and reload"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isRecovering ? "Clearing..." : "Reset Cache"}
            </button>

            <button
              className={`eb-btn-copy-report ${copied ? "eb-btn-copy-report--copied" : ""}`}
              onClick={this.handleCopyReport}
              disabled={isRecovering}
              aria-label={copied ? "Report copied to clipboard" : "Copy diagnostic report to clipboard"}
              aria-live="polite"
              title={copied ? "Copied!" : "Copy error details for reporting"}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Report
                </>
              )}
            </button>
          </div>

          {/* ── Recovery Status Message ── */}
          {recoveryMessage && (
            <div className="eb-recovery-message" role="status" aria-live="polite">
              <span className="eb-recovery-spinner" aria-hidden="true" />
              {recoveryMessage}
            </div>
          )}

          {/* ── Diagnostics Toggle ── */}
          <button
            className="eb-diagnostics-toggle"
            onClick={this.toggleDiagnostics}
            disabled={isRecovering}
            aria-expanded={showDiagnostics}
            aria-controls="eb-diagnostics-panel"
            title={
              isRecovering
                ? "Operation in progress..."
                : showDiagnostics
                ? "Hide diagnostic information"
                : "Show diagnostic information"
            }
           aria-label="button">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`eb-diagnostics-chevron ${showDiagnostics ? "eb-diagnostics-chevron--open" : ""}`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showDiagnostics ? "Hide Diagnostics" : "View Diagnostics"}
          </button>

          {/* ── Collapsible Diagnostics Panel ── */}
          <div
            id="eb-diagnostics-panel"
            className={`eb-diagnostics-panel ${showDiagnostics ? "eb-diagnostics-panel--open" : ""}`}
            aria-hidden={!showDiagnostics}
          >
            {/* Meta grid */}
            <div className="eb-meta-grid">
              <div className="eb-meta-item">
                <span className="eb-meta-label">URL</span>
                <span className="eb-meta-value">{sanitizeUrl(window.location.href)}</span>
              </div>
              <div className="eb-meta-item">
                <span className="eb-meta-label">Timestamp</span>
                <span className="eb-meta-value">{new Date().toLocaleString()}</span>
              </div>
              <div className="eb-meta-item eb-meta-item--full">
                <span className="eb-meta-label">User Agent</span>
                <span className="eb-meta-value">{navigator.userAgent}</span>
              </div>
            </div>

            {/* Stack trace */}
            <div className="eb-diagnostic-section">
              <p className="eb-section-title">Stack Trace</p>
              <pre className="eb-stack" tabIndex={0} aria-label="JavaScript stack trace">
                {error?.stack || "No stack trace available."}
                {errorInfo?.componentStack && `\n\nComponent Stack:\n${errorInfo.componentStack}`}
              </pre>
            </div>

            {/* LocalStorage snapshot */}
            <div className="eb-diagnostic-section">
              <p className="eb-section-title">LocalStorage Snapshot</p>
              <pre className="eb-stack" tabIndex={0} aria-label="LocalStorage contents">
                {lsSnapshot}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
