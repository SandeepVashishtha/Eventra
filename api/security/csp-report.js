import { logCspViolation } from "../../src/utils/securityLogger.js";
import { isValidCspReport } from "../../src/utils/cspReportValidator.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const report = req.body;

    if (!isValidCspReport(report)) {
      return res.status(400).json({
        error: "Invalid CSP report",
      });
    }

    logCspViolation(report);

    return res.status(204).end();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}