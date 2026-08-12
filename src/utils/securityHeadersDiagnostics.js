export const getSecurityHeadersDiagnostics = () => {
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
      import.meta.env?.VITE_CSP_REPORT_URI ||
      "Not configured",
    status:
      import.meta.env?.VITE_CSP_REPORT_URI
        ? "success"
        : "warning",
    recommendation:
      import.meta.env?.VITE_CSP_REPORT_URI
        ? "Violation reporting enabled."
        : "Configure VITE_CSP_REPORT_URI for reporting.",
  });

  return diagnostics;
};