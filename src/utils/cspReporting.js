/**
 * CSP Violation Reporting & Recursive Loop Prevention (#13909)
 */

import { isValidCspReport, isSelfOriginatingCspReport } from "./cspReportValidator.js";

const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const isDev = runtimeEnv.DEV ?? runtimeEnv.NODE_ENV === "development";
const reportUri = runtimeEnv.VITE_CSP_REPORT_URI || runtimeEnv.REACT_APP_CSP_REPORT_URI || null;

// FIX (#13909): Circuit Breaker and Sliding Window Rate Limiting Variables
let isProcessingReport = false;
const reportTimestamps = [];
const MAX_REPORTS_PER_WINDOW = 3;
const WINDOW_DURATION_MS = 10000;

export function checkRateLimit() {
  const now = Date.now();
  // Filter out timestamps outside the 10s sliding window
  while (reportTimestamps.length > 0 && reportTimestamps[0] <= now - WINDOW_DURATION_MS) {
    reportTimestamps.shift();
  }

  if (reportTimestamps.length >= MAX_REPORTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  reportTimestamps.push(now);
  return true;
}

export function resetCspReportingState() {
  isProcessingReport = false;
  reportTimestamps.length = 0;
}

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

function sendReport(report, blockedUri) {
  if (!reportUri) return;
  if (isSelfOriginatingCspReport(blockedUri, reportUri)) {
    console.warn("[CSP Reporting] Blocked self-originating report to prevent recursion loop.");
    return;
  }

  const blob = new Blob([JSON.stringify(report)], {
    type: 'application/csp-report',
  });

  try {
    navigator.sendBeacon(reportUri, blob);
  } catch {
    fetch(reportUri, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/csp-report' },
      keepalive: true,
    }).catch(() => {});
  }
}

let _cspHandler = null;

export function initCspReporting() {
  if (typeof document === 'undefined') return;
  if (_cspHandler) return;

  _cspHandler = (event) => {
    // FIX (#13909): Execution recursion guard & circuit breaker
    if (isProcessingReport) {
      console.warn("[CSP Circuit Breaker] Intercepted recursive violation trigger.");
      return;
    }

    if (!checkRateLimit()) {
      console.warn("[CSP Rate Limit] Exceeded 3 reports per 10s window limit.");
      return;
    }

    isProcessingReport = true;
    try {
      const report = buildReport(event);
      if (!isValidCspReport(report)) return;

      if (isDev) {
        console.warn(
          '[CSP Violation]',
          `Directive: ${event.effectiveDirective}`,
          `Blocked: ${event.blockedURI || '(inline)'}`,
          `Source: ${event.sourceFile}:${event.lineNumber}`,
          report
        );
      }

      sendReport(report, event.blockedURI);
    } finally {
      isProcessingReport = false;
    }
  };

  document.addEventListener('securitypolicyviolation', _cspHandler);
}

export function teardownCspReporting() {
  if (typeof document === 'undefined') return;
  if (!_cspHandler) return;

  document.removeEventListener('securitypolicyviolation', _cspHandler);
  _cspHandler = null;
  resetCspReportingState();
}
