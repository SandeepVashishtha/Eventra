/**
 * CSP Report Validator & Endpoint Domain Filtering (#13909)
 */

export function isValidCspReport(report) {
  if (!report || typeof report !== "object" || !report["csp-report"]) {
    return false;
  }
  const body = report["csp-report"];
  return Boolean(body["violated-directive"] || body["effective-directive"]);
}

export function isSelfOriginatingCspReport(blockedUri, reportUri) {
  if (!blockedUri || !reportUri) return false;

  try {
    const blockedHost = new URL(blockedUri).host;
    const reportHost = new URL(reportUri).host;
    return blockedHost === reportHost;
  } catch {
    return blockedUri.includes(reportUri) || reportUri.includes(blockedUri);
  }
}
