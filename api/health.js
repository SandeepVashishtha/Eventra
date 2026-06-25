import { getHealthReport } from "../_lib/health.js";
import { buildCorsHeaders } from "../auth/_cors.js";

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
    console.error("[Health Endpoint] Error:", error);
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Service unavailable",
    });
  }
}
