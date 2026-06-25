/**
 * CSP Violation Reporting
 *
 * Registers a `securitypolicyviolation` listener that logs CSP violations
 * in development and, in production, sends them to a reporting endpoint
 * (when one is configured via REACT_APP_CSP_REPORT_URI).
 *
 * This module is imported once from index.js at application startup. It is
 * deliberately side-effect-free on import — the listener is only attached
 * when `initCspReporting()` is explicitly called.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The Content-Security-Policy was tightened to add `style-src-elem` (which
 * blocks injected `<style>` blocks without `unsafe-inline`) alongside
 * `style-src-attr 'unsafe-inline'` (which permits Framer Motion's inline
 * `style=""` attributes). Violation reporting ensures that any legitimate
 * inline style blocks that were missed during the audit are surfaced
 * immediately in the browser console and reported to the team, rather than
 * silently breaking the UI.
 */

const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const isDev = runtimeEnv.DEV ?? runtimeEnv.NODE_ENV === "development";
const reportUri = runtimeEnv.VITE_CSP_REPORT_URI || runtimeEnv.REACT_APP_CSP_REPORT_URI || null;

/**
 * Formats a SecurityPolicyViolationEvent into a structured report object
 * that is safe to serialise and send to a reporting endpoint.
 *
 * @param {SecurityPolicyViolationEvent} event
 * @returns {object}
 */
function buildReport(event) {
  return {
    "csp-report": {
      "document-uri": event.documentURI,
      "violated-directive": event.violatedDirective,
      "effective-directive": event.effectiveDirective,
      "original-policy": event.originalPolicy,
      "blocked-uri": event.blockedURI,
      "source-file": event.sourceFile,
      "line-number": event.lineNumber,
      "column-number": event.columnNumber,
      "status-code": event.statusCode,
    },
  };
}

/**
 * Sends a CSP violation report to REACT_APP_CSP_REPORT_URI using the
 * Beacon API (fire-and-forget, does not block page unload).
 *
 * @param {object} report - Output of buildReport().
 */
function sendReport(report) {
  if (!reportUri) return;

  const blob = new Blob([JSON.stringify(report)], {
    type: "application/csp-report",
  });

  try {
    navigator.sendBeacon(reportUri, blob);
  } catch {
    // Beacon API unavailable — fall back to a best-effort fetch.
    fetch(reportUri, {
      method: "POST",
      body: JSON.stringify(report),
      headers: { "Content-Type": "application/csp-report" },
      keepalive: true,
    }).catch(() => {
      // Swallow — reporting is best-effort and must never crash the app.
    });
  }
}

// ---------------------------------------------------------------------------
// Module-scoped handler reference
//
// Storing the handler at module scope is the only way to guarantee that
// initCspReporting() and teardownCspReporting() operate on the SAME function
// object. addEventListener/removeEventListener use reference equality, so
// passing a new anonymous function to removeEventListener silently fails to
// remove the previously registered listener, causing a memory leak.
// ---------------------------------------------------------------------------
let _cspHandler = null;

/**
 * Attaches the CSP violation listener to the document.
 *
 * Call this once from the application entry point (index.js) after the
 * DOM is ready. Calling it again while already active is a no-op.
 */
export function initCspReporting() {
  if (typeof document === "undefined") return;
  // Guard against double registration
  if (_cspHandler) return;

  _cspHandler = (event) => {
    const report = buildReport(event);

    if (isDev) {
      // Surfaced as a warning so it is visible in DevTools without
      // being confused with an application error.
      console.warn(
        "[CSP Violation]",
        `Directive: ${event.effectiveDirective}`,
        `Blocked: ${event.blockedURI || "(inline)"}`,
        `Source: ${event.sourceFile}:${event.lineNumber}`,
        report
      );
    }

    sendReport(report);
  };

  document.addEventListener("securitypolicyviolation", _cspHandler);
}

/**
 * Removes the CSP violation listener.
 *
 * Uses the same `_cspHandler` reference that was registered in
 * `initCspReporting()` so the listener is actually removed. Previously
 * this passed a new anonymous function to removeEventListener, which
 * silently did nothing and caused a memory leak on every test teardown.
 */
export function teardownCspReporting() {
  if (typeof document === "undefined") return;
  if (!_cspHandler) return;

  document.removeEventListener("securitypolicyviolation", _cspHandler);
  _cspHandler = null;
}
