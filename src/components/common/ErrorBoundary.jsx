import React from "react";
import "./ErrorBoundary.css";
import { logError } from "../../utils/errorLogger";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a short, human-readable error reference ID */
function generateErrorId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "EV-";
  for (let i = 0; i < 7; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/** Persist error info to localStorage for post-reload diagnosis */
function persistErrorLog(errorId, error, errorInfo) {
  try {
    const log = {
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      message: error ? error.toString() : "Unknown error",
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
    };
    const existing = JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
    existing.unshift(log);
    // Keep only the 5 most recent errors
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 5)));
  } catch (_) {
    // Never crash inside the error boundary
  }
}

/** Build a readable diagnostic text report */
function buildDiagnosticReport(errorId, error, errorInfo) {
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
      return "Unable to read localStorage";
    }
  })();

  return `=== EVENTRA DIAGNOSTIC REPORT ===
Error ID   : ${errorId}
Timestamp  : ${new Date().toISOString()}
URL        : ${window.location.href}
User-Agent : ${navigator.userAgent}

--- Error ---
${error ? error.toString() : "Unknown error"}

--- Stack Trace ---
${error?.stack || "No stack trace"}

--- Component Stack ---
${errorInfo?.componentStack || "No component stack"}

--- LocalStorage Snapshot ---
${lsSnapshot}
==================================`;
}

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
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Structured logging
    logError(error, errorInfo);

    // Persist to localStorage so the error survives a reload
    persistErrorLog(this.state.errorId || "EV-UNKNOWN", error, errorInfo);
  }

  // ── Recovery Actions ────────────────────────────────────────────────────────

  /** Hard reload — fastest recovery */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Soft retry — resets error boundary state without reloading.
   * Preserves the full user session (auth tokens, preferences, etc.)
   * Caps at 3 retries to avoid infinite loops.
   */
  handleTryAgain = () => {
    const { retryCount } = this.state;
    if (retryCount >= 3) {
      // Too many retries — fall back to hard reload
      window.location.reload();
      return;
    }
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  /**
   * Cache reset — clears only Eventra-specific cache keys, not auth tokens,
   * so the user stays logged in after the reload.
   */
  handleResetCache = () => {
    try {
      const SESSION_KEYS_TO_PRESERVE = [
        "eventra_user",
        "eventra_token",
        "eventra_refresh_token",
        "eventra_theme",
        "cursor",
      ];

      // Save session data before wiping
      const preserved = {};
      SESSION_KEYS_TO_PRESERVE.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) preserved[key] = val;
      });

      localStorage.clear();

      // Restore session data
      Object.entries(preserved).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
    } catch (_) {
      // If localStorage is unavailable, just reload
    }
    window.location.reload();
  };

  /** Copy the full diagnostic report to clipboard */
  handleCopyReport = () => {
    const { error, errorInfo, errorId } = this.state;
    const report = buildDiagnosticReport(errorId, error, errorInfo);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(report)
        .then(() => {
          this.setState({ copied: true });
          setTimeout(() => this.setState({ copied: false }), 2500);
        })
        .catch(() => {
          this._fallbackCopy(report);
        });
    } else {
      this._fallbackCopy(report);
    }
  };

  _fallbackCopy = (text) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch (_) {}
  };

  toggleDiagnostics = () => {
    this.setState((prev) => ({ showDiagnostics: !prev.showDiagnostics }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, errorId, copied, showDiagnostics, retryCount } = this.state;
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
      >
        {/* Animated background glows */}
        <div className="eb-bg-glow eb-bg-glow--1" aria-hidden="true" />
        <div className="eb-bg-glow eb-bg-glow--2" aria-hidden="true" />

        <div className="eb-card" role="document">
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
              aria-label="Reload the page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </button>

            <button
              className="eb-btn-secondary"
              onClick={this.handleTryAgain}
              disabled={tooManyRetries}
              aria-label={
                tooManyRetries
                  ? "Maximum retries reached — please reload"
                  : `Try again without reloading (attempt ${retryCount + 1} of 3)`
              }
              title={tooManyRetries ? "Too many retries — reloading instead" : "Try again"}
            >
              {tooManyRetries ? "Reload Instead" : "Try Again"}
              {retryCount > 0 && !tooManyRetries && (
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
              aria-label="Reset app cache and reload. Your session will be preserved."
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Cache
            </button>

            <button
              className={`eb-btn-copy-report ${copied ? "eb-btn-copy-report--copied" : ""}`}
              onClick={this.handleCopyReport}
              aria-label={copied ? "Report copied to clipboard" : "Copy diagnostic report to clipboard"}
              aria-live="polite"
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
                  Copy Diagnostic Report
                </>
              )}
            </button>
          </div>

          {/* ── Diagnostics Toggle ── */}
          <button
            className="eb-diagnostics-toggle"
            onClick={this.toggleDiagnostics}
            aria-expanded={showDiagnostics}
            aria-controls="eb-diagnostics-panel"
          >
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
                <span className="eb-meta-value">{window.location.href}</span>
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