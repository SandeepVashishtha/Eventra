import { getHealthReport } from "../_lib/health.js";
import { buildCorsHeaders } from "../auth/_cors.js";
import { handleServerError } from "../_lib/errorHandler.js";

export default async function healthHandler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const report = await getHealthReport();
    const httpStatus = report.status === "healthy" ? 200 : 503;
    return res.status(httpStatus).json(report);
  } catch (error) {
    return handleServerError(res, error, { endpoint: '/health' }, 503);
  }
}
