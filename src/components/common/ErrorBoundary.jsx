import React from "react";
import "./ErrorBoundary.css";
import { logError, persistErrors } from "../../utils/errorLogger";

function generateErrorId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "EV-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

const SENSITIVE_URL_PARAMS = new Set([
  "token", "code", "state", "key", "secret", "reset",
  "id_token", "access_token", "refresh_token", "otp",
  "password", "auth", "api_key",
]);

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    for (const param of parsed.searchParams.keys()) {
      if (SENSITIVE_URL_PARAMS.has(param.toLowerCase())) {
        parsed.searchParams.set(param, "***");
      }
    }
    return parsed.href;
  } catch {
    return url;
  }
}

function attemptStateRecovery() {
  try {
    const savedState = sessionStorage.getItem("eventra_component_state_backup");
    if (savedState) {
      const parsed = JSON.parse(savedState, (key, value) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;
        return value;
      });
      window.__EVENTRA_RECOVERED_STATE__ = parsed;
      sessionStorage.removeItem("eventra_component_state_backup");
      return true;
    }
  } catch {}
  return false;
}

function saveAppStateSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      url: sanitizeUrl(window.location.href),
      localStorage: (() => {
        const snap = {};
        const ALLOWED = ["my_events_", "bookmarks_", "eventra_theme", "eventra_language", "eventra_preferences"];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && ALLOWED.some((safe) => k.startsWith(safe))) {
            try { snap[k] = localStorage.getItem(k)?.slice(0, 100); } catch {}
          }
        }
        return snap;
      })(),
      sessionStorage: (() => {
        const snap = {};
        const ALLOWED = ["my_events_", "bookmarks_", "eventra_theme", "eventra_language", "eventra_preferences"];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && ALLOWED.some((safe) => k.startsWith(safe))) {
            snap[k] = sessionStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
    };
    sessionStorage.setItem("eventra_state_snapshot", JSON.stringify(snapshot));
  } catch {}
}

function buildDiagnosticReport(errorId, error, errorInfo) {
  // Fix for #7246: each IIFE must fully close its try/catch block before the
  // next declaration so the parser does not misread subsequent class methods
  // (e.g. handleTryAgain) as being inside this function's scope.
  const lsSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password") && !k.includes("eventra:key-material") && !k.includes("eventra:key-salt")) {
          try { snap[k] = process.env.NODE_ENV === "production" ? "[redacted]" : (localStorage.getItem(k)?.slice(0, 200)); } catch {}
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch {
      return "Unable to read localStorage";
    }
  })();

  const sessionSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password")) {
          try { snap[k] = sessionStorage.getItem(k)?.slice(0, 200); } catch {}
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch {
      return "Unable to read sessionStorage";
    }
  })();

  return `=== EVENTRA DIAGNOSTIC REPORT ===
Error ID      : ${errorId}
Timestamp     : ${new Date().toISOString()}
URL           : ${sanitizeUrl(window.location.href)}
User-Agent    : ${navigator.userAgent}
Screen Size   : ${window.innerWidth}x${window.innerHeight}
Device Pixel  : ${window.devicePixelRatio}
Online Status : ${navigator.onLine}

--- Error ---
${error ? error.toString() : "Unknown error"}

--- Stack Trace ---
${error?.stack || "No stack trace"}

--- Component Stack ---
${errorInfo?.componentStack || "No component stack"}

--- LocalStorage Snapshot ---
${lsSnapshot}

--- SessionStorage Snapshot ---
${sessionSnapshot}

--- Browser Info ---
Language: ${navigator.language}
Platform: ${navigator.platform}
Cookies Enabled: ${navigator.cookieEnabled}
--- End of Report ---`;
}

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
    const { level = "page", label } = this.props;
    const errorId = this.state.errorId ?? generateErrorId();
    const errorLabel = label || (level === "page" ? "Page" : level === "section" ? "Section" : "Feature");
    this.setState({ errorInfo, errorId });

    logError(error, errorInfo, { level, label: errorLabel });

    persistErrors("error_log", {
      errorId,
      level,
      label: errorLabel,
      message: error?.toString() || "Unknown error",
      timestamp: new Date().toISOString(),
      url: sanitizeUrl(window.location.href),
      userAgent: navigator.userAgent,
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
    }, 10);

    console.error(`[ErrorBoundary:${errorLabel}]`, error, errorInfo);

    if (typeof this.props.onError === "function") {
      try {
        this.props.onError(error, errorInfo);
      } catch {}
    }
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

    if (typeof this.props.onRetry === "function") {
      this.props.onRetry();
    }
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
    } catch {
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
        try {
          const blob = new Blob([report], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
        } catch {}
      });
  };

  toggleDiagnostics = () => {
    this.setState((prev) => ({ showDiagnostics: !prev.showDiagnostics }));
  };

  renderPageFallback() {
    const {
      error, errorInfo, errorId, copied,
      showDiagnostics, retryCount, isRecovering, recoveryMessage,
    } = this.state;
    const tooManyRetries = retryCount >= 3;

    const lsSnapshot = (() => {
      try {
        const snap = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password") && !k.includes("eventra:key-material") && !k.includes("eventra:key-salt")) {
            try { snap[k] = process.env.NODE_ENV === "production" ? "[redacted]" : (localStorage.getItem(k)?.slice(0, 200)); } catch {}
          }
        }
        return JSON.stringify(snap, null, 2);
      } catch {
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
        <div className="eb-bg-glow eb-bg-glow--1" aria-hidden="true" />
        <div className="eb-bg-glow eb-bg-glow--2" aria-hidden="true" />

        <div className={`eb-card ${isRecovering ? "eb-card--recovering" : ""}`} role="document">
          <div className="eb-glow-1" aria-hidden="true" />
          <div className="eb-glow-2" aria-hidden="true" />

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

          <h1 className="eb-title" id="eb-title">
            System Crash Prevented
          </h1>
          <p className="eb-message" id="eb-description">
            Eventra encountered an unexpected crash. The issue has been intercepted and
            logged. You can try reloading, resetting your local cache, or copying the
            diagnostic report below to report this issue.
          </p>

          {errorId && (
            <p className="eb-error-id" aria-label={`Error reference: ${errorId}`}>
              Error Reference ID: <strong>{errorId}</strong>
            </p>
          )}

          {error && (
            <div className="eb-error-message-box" role="region" aria-label="Error details">
              <span className="eb-error-label">Error</span>
              <p className="eb-error-text">{error.toString()}</p>
            </div>
          )}

          <div className="eb-actions">
            <button
              className="eb-btn-primary"
              onClick={this.handleReload}
              disabled={isRecovering}
              aria-label="Reload the page"
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
                isRecovering ? "Recovery in progress..." :
                tooManyRetries ? "Maximum retries reached" :
                `Try again (attempt ${retryCount + 1} of 3)`
              }
            >
              {isRecovering ? (
                <><span className="eb-spinner" aria-hidden="true" /> Recovering...</>
              ) : tooManyRetries ? "Reload Instead" : "Try Again"}
              {retryCount > 0 && !tooManyRetries && !isRecovering && (
                <span className="eb-retry-badge" aria-hidden="true">{retryCount}/3</span>
              )}
            </button>
          </div>

          <div className="eb-actions eb-actions--secondary">
            <button
              className="eb-btn-reset-cache"
              onClick={this.handleResetCache}
              disabled={isRecovering}
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
              aria-live="polite"
            >
              {copied ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Copy Report</>
              )}
            </button>
          </div>

          {recoveryMessage && (
            <div className="eb-recovery-message" role="status" aria-live="polite">
              <span className="eb-recovery-spinner" aria-hidden="true" />
              {recoveryMessage}
            </div>
          )}

          <button
            className="eb-diagnostics-toggle"
            onClick={this.toggleDiagnostics}
            disabled={isRecovering}
            aria-expanded={showDiagnostics}
            aria-controls="eb-diagnostics-panel"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className={`eb-diagnostics-chevron ${showDiagnostics ? "eb-diagnostics-chevron--open" : ""}`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showDiagnostics ? "Hide Diagnostics" : "View Diagnostics"}
          </button>

          <div
            id="eb-diagnostics-panel"
            className={`eb-diagnostics-panel ${showDiagnostics ? "eb-diagnostics-panel--open" : ""}`}
            aria-hidden={!showDiagnostics}
          >
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

            <div className="eb-diagnostic-section">
              <p className="eb-section-title">Stack Trace</p>
              <pre className="eb-stack" tabIndex={0} aria-label="JavaScript stack trace">
                {error?.stack || "No stack trace available."}
                {errorInfo?.componentStack && `\n\nComponent Stack:\n${errorInfo.componentStack}`}
              </pre>
            </div>

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

  renderSectionFallback() {
    const { label = "This section", fallback, silent } = this.props;
    const { error, retryCount } = this.state;
    const tooManyRetries = retryCount >= 3;

    if (silent) return null;

    if (fallback) {
      return typeof fallback === "function" ? fallback(error, this.handleTryAgain) : fallback;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          padding: "32px 24px",
          textAlign: "center",
          borderRadius: "16px",
          border: "1px solid rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.04)",
          margin: "16px",
        }}
      >
        <svg
          width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          style={{ color: "#f87171", marginBottom: "12px" }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.293 3.757L2.05 18.243A2 2 0 003.757 21h16.486a2 2 0 001.708-3.05L13.708 3.757a2 2 0 00-3.414 0z" />
        </svg>

        <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#ef4444", marginBottom: "6px" }}>
          {label} failed to load
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "20px", maxWidth: "300px", lineHeight: "1.5" }}>
          {error?.message || "An unexpected error occurred in this section."}
        </p>

        <button
          onClick={this.handleTryAgain}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 20px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
          aria-label={tooManyRetries ? "Reload the full page" : `Try loading ${label} again (attempt ${retryCount + 1})`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {tooManyRetries ? "Reload Page" : "Try Again"}
        </button>
      </div>
    );
  }

  renderFeatureFallback() {
    const { label = "This feature", fallback } = this.props;
    const { error, retryCount } = this.state;
    const tooManyRetries = retryCount >= 3;

    if (fallback) {
      return typeof fallback === "function" ? fallback(error, this.handleTryAgain) : fallback;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="eb-feature-fallback"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="eb-feature-icon" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.293 3.757L2.05 18.243A2 2 0 003.757 21h16.486a2 2 0 001.708-3.05L13.708 3.757a2 2 0 00-3.414 0z" />
        </svg>

        <h2 className="eb-feature-title">{label} failed to load</h2>

        <p className="eb-feature-message">
          {error?.message || "An unexpected error occurred."}
        </p>

        <button
          onClick={this.handleTryAgain}
          className="eb-feature-retry-btn"
          aria-label={tooManyRetries ? "Reload the full page" : `Retry loading ${label} (attempt ${retryCount + 1})`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {tooManyRetries ? "Reload Page" : "Retry"}
          {retryCount > 0 && !tooManyRetries && (
            <span className="eb-feature-retry-badge">{retryCount}/3</span>
          )}
        </button>
      </div>
    );
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { level = "page" } = this.props;
    const { error } = this.state;
    const { fallback } = this.props;

    if (fallback && typeof fallback === "function") {
      return fallback(error, this.handleTryAgain);
    }

    if (fallback && React.isValidElement(fallback)) {
      return fallback;
    }

    switch (level) {
      case "section":
        return this.renderSectionFallback();
      case "feature":
        return this.renderFeatureFallback();
      default:
        return this.renderPageFallback();
    }
  }
}

export default ErrorBoundary;
