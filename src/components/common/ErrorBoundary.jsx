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

/** 
 * Attempt to recover component state from sessionStorage
 * This preserves state across soft retries and reloads
 */
function attemptStateRecovery() {
  try {
    const savedState = sessionStorage.getItem("eventra_component_state_backup");
    if (savedState) {
      window.__EVENTRA_RECOVERED_STATE__ = JSON.parse(savedState);
      sessionStorage.removeItem("eventra_component_state_backup");
      return true;
    }
  } catch (_) {
    // State recovery failed silently
  }
  return false;
}

/** Save critical app state before attempting cache reset */
function saveAppStateSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      localStorage: (() => {
        const snap = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password")) {
            snap[k] = localStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
      sessionStorage: (() => {
        const snap = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password")) {
            snap[k] = sessionStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
    };
    sessionStorage.setItem("eventra_state_snapshot", JSON.stringify(snapshot));
  } catch (_) {}
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
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      appState: (() => {
        try {
          return window.__EVENTRA_APP_STATE__ || {};
        } catch (_) {
          return {};
        }
      })(),
    };
    const existing = JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
    existing.unshift(log);
    // Keep only the 5 most recent errors
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 5)));
  } catch (_) {
    // Never crash inside the error boundary
  }
}

/** Build a readable diagnostic text report with enhanced information */
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

  const sessionSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password")) {
          snap[k] = sessionStorage.getItem(k)?.slice(0, 200);
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch (_) {
      return "Unable to read sessionStorage";
    }
  })();

  return `=== EVENTRA DIAGNOSTIC REPORT ===
Error ID      : ${errorId}
Timestamp     : ${new Date().toISOString()}
URL           : ${window.location.href}
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
<<<<<<< HEAD
      errorId: generateErrorId(),
=======
>>>>>>> 58452a7a (Improve ErrorBoundary crash screen UI/UX)
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Structured logging
    logError(error, errorInfo);

    // Persist to localStorage so the error survives a reload
    persistErrorLog(this.state.errorId || "EV-UNKNOWN", error, errorInfo);
    
    // Save app state snapshot
    saveAppStateSnapshot();
  }

  // ── Recovery Actions ────────────────────────────────────────────────────────

  /** Hard reload — fastest recovery */
  handleReload = () => {
    this.setState({ isRecovering: true, recoveryMessage: "Reloading page..." });
    // Give UI time to update before reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
      this.handleReload();
      return;
    }
    
    this.setState({ isRecovering: true, recoveryMessage: "Attempting recovery..." });
    
    // Clear error after a brief delay to show feedback
    setTimeout(() => {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        recoveryMessage: "",
        retryCount: prev.retryCount + 1,
      }));
    }, 600);
  };

  /**
   * Cache reset — clears only Eventra-specific cache keys, not auth tokens,
   * so the user stays logged in after the reload.
   */
  handleResetCache = () => {
    this.setState({ isRecovering: true, recoveryMessage: "Clearing cache..." });
    
    try {
      const SESSION_KEYS_TO_PRESERVE = [
        "eventra_user",
        "eventra_token",
        "eventra_refresh_token",
        "eventra_theme",
        "eventra_preferences",
        "cursor",
      ];

      // Save session data before wiping
      const preserved = {};
      SESSION_KEYS_TO_PRESERVE.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) preserved[key] = val;
      });

      // Clear all localStorage
      localStorage.clear();

      // Restore session data
      Object.entries(preserved).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      
      // Also clear sessionStorage (non-critical data)
      sessionStorage.clear();
      
      // Update feedback
      this.setState({ recoveryMessage: "Cache cleared. Reloading..." });
      
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      // If localStorage is unavailable, just reload
      console.warn("Cache reset failed:", err);
      this.setState({ recoveryMessage: "Reloading..." });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  /** Copy the full diagnostic report to clipboard */
  handleCopyReport = () => {
<<<<<<< HEAD
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
=======
    const { error, errorInfo } = this.state;

    const report = `
EVENTRA DIAGNOSTICS

Timestamp:
${new Date().toISOString()}

URL:
${window.location.href}

Error:
${error?.toString() || "Unknown error"}

Stack:
${error?.stack || "No stack"}

Component Stack:
${errorInfo?.componentStack || "Unavailable"}

Local Storage:
${JSON.stringify(localStorage, null, 2)}
`;

    navigator.clipboard
      .writeText(report)
      .then(() => {
        this.setState({ copied: true });

        setTimeout(() => {
          this.setState({ copied: false });
        }, 2000);
      })
      .catch(console.error);
>>>>>>> 58452a7a (Improve ErrorBoundary crash screen UI/UX)
  };

  _fallbackCopy = (text) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch (_) {
      console.warn("Fallback copy failed");
    }
  };

  toggleDiagnostics = () => {
    this.setState((prev) => ({ showDiagnostics: !prev.showDiagnostics }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

<<<<<<< HEAD
    const { error, errorInfo, errorId, copied, showDiagnostics, retryCount, isRecovering, recoveryMessage } = this.state;
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
              title={tooManyRetries ? "Too many retries — reloading instead" : isRecovering ? "Recovering..." : "Try again"}
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
            title={isRecovering ? "Operation in progress..." : (showDiagnostics ? "Hide diagnostic information" : "Show diagnostic information")}
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
=======
    const timestamp = new Date().toLocaleString();
    const url = window.location.href;
    const userAgent = navigator.userAgent;
    const errorText =
      this.state.error?.toString() || "Unknown runtime error";

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5 text-white relative overflow-hidden">

        {/* subtle glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl p-6">

          {/* HEADER */}
          <div className="flex flex-col items-center text-center">

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-7 4h14L12 4 5 19z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-white">
              System Crash Prevented
            </h1>

            <p className="text-sm text-slate-400 mt-3 max-w-md">
              We detected an unexpected issue and stopped it before it affected
              your session. You can safely reload or retry.
            </p>
          </div>

          {/* ERROR */}
          <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">

            <div className="text-xs uppercase text-rose-400 font-semibold mb-2">
              Error Message
            </div>

            <div className="text-sm font-mono break-all text-slate-200">
              {errorText}
            </div>

          </div>

          {/* METADATA */}
          <div className="mt-5 grid gap-3">

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-slate-400 mb-1">
                Current URL
              </div>

              <div className="text-xs break-all">
                {url}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-slate-400 mb-1">
                Timestamp
              </div>

              <div className="text-xs">
                {timestamp}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-slate-400 mb-1">
                User Agent
              </div>

              <div className="text-xs break-all">
                {userAgent}
              </div>
            </div>

          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col gap-3">

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-medium"
            >
              Reload Page
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              Try Again
            </button>

            <button
              onClick={this.handleResetCache}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Reset Cache
            </button>

          </div>

          {/* DIAGNOSTICS */}
          <details className="mt-6 rounded-xl border border-white/10 overflow-hidden">

            <summary className="cursor-pointer px-4 py-3 text-sm text-slate-300">
              Diagnostics
            </summary>

            <div className="p-4 border-t border-white/10">

              <pre className="text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-56 whitespace-pre-wrap">
                {this.state.error?.stack}

                {this.state.errorInfo?.componentStack}
              </pre>

              <button
                onClick={this.handleCopyReport}
                className={`mt-4 w-full rounded-xl py-2 transition ${
                  this.state.copied
                    ? "bg-emerald-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {this.state.copied
                  ? "Diagnostic Report Copied"
                  : "Copy Diagnostic Report"}
              </button>

            </div>

          </details>

        </div>

>>>>>>> 58452a7a (Improve ErrorBoundary crash screen UI/UX)
      </div>
    );
  }
}

export default ErrorBoundary;