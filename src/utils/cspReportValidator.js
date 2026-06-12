export function isValidCspReport(report) {
  if (!report || typeof report !== "object") return false;

  const payload = report["csp-report"];
  if (!payload || typeof payload !== "object") return false;

  const violatedDirective = payload["violated-directive"];
  if (typeof violatedDirective !== "string" || violatedDirective.length > 500) {
    return false;
  }

  // Prevent script/HTML tag injection in reports
  const blockedUri = payload["blocked-uri"];
  if (typeof blockedUri === "string") {
    if (/<script|javascript:|data:/i.test(blockedUri)) {
      return false;
    }
  }

  return true;
}
