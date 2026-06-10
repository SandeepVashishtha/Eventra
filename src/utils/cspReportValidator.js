export function isValidCspReport(report) {
  if (!report) return false;

  const payload = report["csp-report"];

  if (!payload) return false;

  if (typeof payload["violated-directive"] !== "string") {
    return false;
  }

  return true;
}