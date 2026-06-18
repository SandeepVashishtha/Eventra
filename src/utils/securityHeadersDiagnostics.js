const _getCspStatus = (cspMeta) => {
  if (cspMeta) return { status: "success", recommendation: "CSP is configured." };
  return { status: "warning", recommendation: "Verify CSP deployment headers." };
};

const _getReportingStatus = (reportUri) => {
  if (reportUri) return { status: "success", recommendation: "Violation reporting enabled." };
  return { status: "warning", recommendation: "Configure REACT_APP_CSP_REPORT_URI for reporting." };
};

export const getSecurityHeadersDiagnostics = () => {
  if (typeof document === "undefined") return [];

  const cspMeta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]'
  );
  const cspStatus = _getCspStatus(cspMeta);

  const reportUri = process.env.REACT_APP_CSP_REPORT_URI;
  const reportingStatus = _getReportingStatus(reportUri);

  return [
    {
      name: "Content-Security-Policy",
      value: cspMeta?.content || "Configured via deployment headers",
      status: cspStatus.status,
      recommendation: cspStatus.recommendation,
    },
    {
      name: "CSP Reporting",
      value: reportUri || "Not configured",
      status: reportingStatus.status,
      recommendation: reportingStatus.recommendation,
    },
  ];
};