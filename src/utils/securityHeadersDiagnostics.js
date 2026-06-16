export const getSecurityHeadersDiagnostics = () => {
  if (typeof document === "undefined") return [];

  const diagnostics = [];

  const cspMeta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]'
  );

  diagnostics.push({
    name: "Content-Security-Policy",
    value: cspMeta?.content || "Configured via deployment headers",
    status: cspMeta ? "success" : "warning",
    recommendation: cspMeta
      ? "CSP is configured."
      : "Verify CSP deployment headers.",
  });

  diagnostics.push({
    name: "CSP Reporting",
    value:
      process.env.REACT_APP_CSP_REPORT_URI ||
      "Not configured",
    status:
      process.env.REACT_APP_CSP_REPORT_URI
        ? "success"
        : "warning",
    recommendation:
      process.env.REACT_APP_CSP_REPORT_URI
        ? "Violation reporting enabled."
        : "Configure REACT_APP_CSP_REPORT_URI for reporting.",
  });

  return diagnostics;
};