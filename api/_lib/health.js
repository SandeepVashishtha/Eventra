import { isStorageHealthy } from "../auth/_user-storage.js";

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
    return { status: "unhealthy", message: error.message };
  }
}

async function checkRateLimiter() {
  try {
    const { rateLimiterStorageHealth } = await import("./rate-limit-storage.js");
    const healthy = typeof rateLimiterStorageHealth === "function"
      ? await rateLimiterStorageHealth().catch(() => false)
      : true;
    return { status: healthy ? "healthy" : "degraded", message: "Rate limiter functional" };
  } catch {
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
