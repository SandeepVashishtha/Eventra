/**
 * User Storage Health Check Utilities
 *
 * Provides health check functionality for user storage systems.
 * Supports both in-memory and Redis-based storage.
 */

const HEALTH_CHECK_TIMEOUT_MS = 5000;

/**
 * Checks if the user storage system is healthy.
 * Attempts a simple read operation to verify connectivity.
 * @param {object} storage - Storage instance (Redis client, KV namespace, or in-memory map)
 * @param {string} [storageType] - Type of storage: 'redis', 'kv', 'memory'
 * @returns {Promise<boolean>} True if storage is healthy
 */
export async function isStorageHealthy(storage, storageType = 'auto') {
  if (!storage) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    if (storageType === 'redis' || (storageType === 'auto' && typeof storage.ping === 'function')) {
      // Redis-like client with ping method
      await storage.ping({ signal: controller.signal });
      return true;
    }

    if (storageType === 'kv' || (storageType === 'auto' && typeof storage.get === 'function')) {
      // Vercel KV / Redis REST API style
      await storage.get('__health_check__', { signal: controller.signal });
      return true;
    }

    if (storageType === 'memory' || (storageType === 'auto' && storage instanceof Map)) {
      // In-memory Map
      storage.has('__health_check__');
      return true;
    }

    // Generic: try to call a health check method if available
    if (typeof storage.healthCheck === 'function') {
      await storage.healthCheck({ signal: controller.signal });
      return true;
    }

    // Fallback: try a simple get/set
    const testKey = '__health_check__' + Date.now();
    if (typeof storage.set === 'function' && typeof storage.get === 'function') {
      await storage.set(testKey, 'ok');
      await storage.get(testKey);
      await storage.delete?.(testKey);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Storage Health] Check failed:', error.message);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Creates a health check endpoint handler.
 * @param {object} storage - Storage instance
 * @param {string} [storageType] - Type of storage
 * @returns {Function} Request handler for health check endpoint
 */
export function createHealthCheckHandler(storage, storageType) {
  return async (request) => {
    const healthy = await isStorageHealthy(storage, 'auto');

    const status = healthy ? 200 : 503;
    const body = {
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      storage: storageType || 'auto',
    };

    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  };
}

/**
 * Middleware to add storage health check to responses.
 * Adds a custom header indicating storage status.
 * @param {object} storage - Storage instance
 * @returns {Function} Middleware function
 */
export function storageHealthMiddleware(storage) {
  return async (request, next) => {
    const healthy = await isStorageHealthy(storage, 'auto');
    const response = await next(request);
    response.headers.set('X-Storage-Health', healthy ? 'healthy' : 'degraded');
    return response;
  };
}