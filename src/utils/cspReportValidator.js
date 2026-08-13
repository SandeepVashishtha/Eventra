/**
 * CSP Report Validator & Endpoint Domain Filtering (#13909)
 */

const isNonHttpScheme = (uri) => {
  if (!uri) return false;
  if (typeof uri !== "string") return true;
  try {
    const scheme = new URL(uri).protocol.replace(":", "");
    return scheme !== "http" && scheme !== "https";
  } catch {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri);
  }
};

export function isValidCspReport(report) {
  if (!report || typeof report !== "object" || !report["csp-report"]) {
    return false;
  }
  const body = report["csp-report"];
  if (!(body["violated-directive"] || body["effective-directive"])) {
    return false;
  }
  // Reject reports that carry scriptable/non-http(s) URIs so that
  // blocked-uri and source-file can never be rendered or forwarded unsanitized.
  if (isNonHttpScheme(body["blocked-uri"]) || isNonHttpScheme(body["source-file"])) {
    return false;
  }
  return true;
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
