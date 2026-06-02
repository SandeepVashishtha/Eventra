let handler = null;

export function initCspReporting() {
  const reportUri = process.env.REACT_APP_CSP_REPORT_URI;

  handler = (event) => {
    const report = {
      "document-uri": event.documentURI,
      "violated-directive": event.violatedDirective,
      "effective-directive": event.effectiveDirective,
      "original-policy": event.originalPolicy,
      "blocked-uri": event.blockedURI,
      "source-file": event.sourceFile,
      "line-number": event.lineNumber,
      "column-number": event.columnNumber,
      "status-code": event.statusCode
    };

    // Dev logging
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[CSP Violation]",
        `Directive: ${event.effectiveDirective}`,
        report
      );
    }

    // Always attempt beacon if endpoint exists
    if (reportUri && typeof navigator !== "undefined" && navigator?.sendBeacon) {
      const blob = new Blob([JSON.stringify({ "csp-report": report })], {
        type: "application/json"
      });

      navigator.sendBeacon(reportUri, blob);
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("securitypolicyviolation", handler);
  }
}

export function teardownCspReporting() {
  if (typeof document !== "undefined" && handler) {
    document.removeEventListener("securitypolicyviolation", handler);
  }
  handler = null;
}