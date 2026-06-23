import { isStorageHealthy } from "../auth/_user-storage.js";
import { logger } from "../../src/utils/logger.js";

const START_TIME = Date.now();
const START_TIME_ISO = new Date(START_TIME).toISOString();

function getMemoryUsage() {
  try {
    const usage = process.memoryUsage();
    return {
      rssBytes: usage.rss,
      rssMB: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
      heapTotalBytes: usage.heapTotal,
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsedBytes: usage.heapUsed,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      heapUsagePercent: usage.heapTotal > 0
        ? Math.round((usage.heapUsed / usage.heapTotal) * 10000) / 100
        : 0,
    };
  } catch {
    return null;
  }
}

function getUptime() {
  const seconds = Math.floor((Date.now() - START_TIME) / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { seconds, formatted: `${days}d ${hours}h ${minutes}m ${seconds % 60}s` };
}

function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    cwd: process.cwd(),
    env: process.env.NODE_ENV || "development",
  };
}

async function checkDatabase() {
  try {
    const result = await isStorageHealthy();
    return { status: result ? "healthy" : "degraded", message: result ? "Database reachable" : "Database unreachable" };
  } catch (error) {
    logger.error("Database health check failed", { message: error.message, stack: error.stack });
    return { status: "unhealthy", message: "Database check failed" };
  }
}

async function checkRateLimiter() {
  try {
    const { isDistributedRateLimitStorageConfigured } = await import("./rate-limit-config.js");
    const isConfigured = isDistributedRateLimitStorageConfigured();
    if (isConfigured) {
      // Try to use the storage layer to verify connectivity
      const { incrementWithExpiration } = await import("./rate-limit-storage.js");
      // Perform a minimal health check with a test key
      await incrementWithExpiration("health-check", 1000);
      return { status: "healthy", message: "Rate limiter (distributed) functional" };
    }
    return { status: "healthy", message: "Rate limiter (in-memory) functional" };
  } catch (error) {
    // If distributed storage is configured but fails, report as degraded
    const { isDistributedRateLimitStorageConfigured } = await import("./rate-limit-config.js");
    if (isDistributedRateLimitStorageConfigured()) {
      logger.error("Rate limiter storage health check failed", { message: error.message, stack: error.stack });
      return { status: "degraded", message: "Rate limiter storage error" };
    }
    // In-memory fallback is acceptable in non-production
    return { status: "healthy", message: "Rate limiter (in-memory) functional" };
  }
}

export async function getHealthReport() {
  const [db, rateLimiter] = await Promise.all([checkDatabase(), checkRateLimiter()]);
  const allHealthy = db.status === "healthy" && rateLimiter.status === "healthy";
  return {
    status: allHealthy ? "healthy" : "degraded",
    version: process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || "unknown",
    uptime: getUptime(),
    startTime: START_TIME_ISO,
    timestamp: new Date().toISOString(),
    memory: getMemoryUsage(),
    system: getSystemInfo(),
    checks: { database: db, rateLimiter },
  };
}
