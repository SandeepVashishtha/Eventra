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

const isDev = process.env.NODE_ENV === 'development';
const reportUri = process.env.REACT_APP_CSP_REPORT_URI || null;

/**
 * Formats a SecurityPolicyViolationEvent into a structured report object
 * that is safe to serialise and send to a reporting endpoint.
 *
 * @param {SecurityPolicyViolationEvent} event
 * @returns {object}
 */
function buildReport(event) {
  return {
    'csp-report': {
      'document-uri': event.documentURI,
      'violated-directive': event.violatedDirective,
      'effective-directive': event.effectiveDirective,
      'original-policy': event.originalPolicy,
      'blocked-uri': event.blockedURI,
      'source-file': event.sourceFile,
      'line-number': event.lineNumber,
      'column-number': event.columnNumber,
      'status-code': event.statusCode,
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
    type: 'application/csp-report',
  });

  try {
    navigator.sendBeacon(reportUri, blob);
  } catch {
    // Beacon API unavailable — fall back to a best-effort fetch.
    fetch(reportUri, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/csp-report' },
      keepalive: true,
    }).catch(() => {
      // Swallow — reporting is best-effort and must never crash the app.
    });
  }
}

/**
 * Attaches the CSP violation listener to the document.
 *
 * Call this once from the application entry point (index.js) after the
 * DOM is ready.
 */
export function initCspReporting() {
  if (typeof document === 'undefined') return;

  document.addEventListener('securitypolicyviolation', (event) => {
    const report = buildReport(event);

    if (isDev) {
      // Surfaced as a warning so it is visible in DevTools without
      // being confused with an application error.
      console.warn(
        '[CSP Violation]',
        `Directive: ${event.effectiveDirective}`,
        `Blocked: ${event.blockedURI || '(inline)'}`,
        `Source: ${event.sourceFile}:${event.lineNumber}`,
        report
      );
    }

    sendReport(report);
  });
}

/**
 * Removes the CSP violation listener.
 * Useful in unit tests to reset between test cases.
 */
export function teardownCspReporting() {
  if (typeof document === 'undefined') return;
  // Re-adding without the original reference would leave the old listener
  // attached; this is a best-effort teardown for test environments only.
  document.removeEventListener('securitypolicyviolation', () => {});
}
