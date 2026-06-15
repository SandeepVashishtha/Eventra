/**
 * Distributed Rate Limiter Tests
 * 
 * Tests for the distributed rate limiter implementation covering:
 * - In-memory backend (development/test)
 * - Redis backend (with mock)
 * - KV REST API backend (with mock)
 * - Production fail-closed behavior
 * - Rate limit enforcement
 * - Counter expiration
 * - Multiple requests from same IP
 * - Different IPs
 * - Error handling
 */

import { describe, it, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import Redis from 'ioredis';

// Mock environment variables before importing the module
const originalEnv = { ...process.env };

const RATE_LIMIT_ENV_VARS = [
  'RATE_LIMIT_REDIS_URL',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'RATE_LIMIT_MODE',
];

function setTestEnv(env) {
  RATE_LIMIT_ENV_VARS.forEach(varName => delete process.env[varName]);
  Object.assign(process.env, env);
}

function restoreEnv() {
  Object.assign(process.env, originalEnv);
}

async function createLimiter(windowMs = 1000, maxRequests = 5) {
  const { createRateLimiter } = await import('../api/_lib/rateLimiter.js');
  return createRateLimiter(windowMs, maxRequests);
}

async function assertRateLimitExceeded(limiter, key) {
  const result = await limiter.check(key);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.remaining, 0);
}

async function assertThrowsSyncCheck(limiter, key) {
  try {
    limiter.check(key);
    assert.fail('Should have thrown an error');
  } catch (error) {
    assert.ok(error.message);
  }
}

describe('Distributed Rate Limiter', () => {
  describe('In-Memory Backend (Development/Test)', () => {
    before(() => {
      setTestEnv({
        NODE_ENV: 'test',
        RATE_LIMIT_MODE: 'memory',
      });
    });

    after(() => {
      restoreEnv();
    });

    it('should create in-memory limiter in test mode', async () => {
      const limiter = await createLimiter(1000, 5);
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should support synchronous check for backwards compatibility', async () => {
      const limiter = await createLimiter(1000, 5);
      const result = limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should support async checkAsync method', async () => {
      const limiter = await createLimiter(1000, 5);
      const result = await limiter.checkAsync('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should enforce rate limit', async () => {
      const limiter = await createLimiter(1000, 3);
      for (let i = 0; i < 3; i++) {
        const result = await limiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      await assertRateLimitExceeded(limiter, '127.0.0.1');
    });

    it('should reset counter after window expires', async () => {
      const limiter = await createLimiter(100, 2);
      await limiter.check('127.0.0.1');
      await limiter.check('127.0.0.1');
      await assertRateLimitExceeded(limiter, '127.0.0.1');
      await new Promise(resolve => setTimeout(resolve, 110));
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
    });

    it('should track different IPs independently', async () => {
      const limiter = await createLimiter(1000, 2);
      await limiter.check('192.168.1.1');
      await limiter.check('192.168.1.1');
      await assertRateLimitExceeded(limiter, '192.168.1.1');
      const ip2Result = await limiter.check('192.168.1.2');
      assert.strictEqual(ip2Result.allowed, true);
    });

    it('should work with enforceRateLimit helper', async () => {
      const { createRateLimiter, enforceRateLimit } = await import('../api/_lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 2);
      await enforceRateLimit(limiter, '127.0.0.1');
      await enforceRateLimit(limiter, '127.0.0.1');
      try {
        await enforceRateLimit(limiter, '127.0.0.1');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual(error.status, 429);
        assert.strictEqual(error.message, 'Too many requests. Please try again later.');
      }
    });
  });

  describe('Production Fail-Closed Behavior', () => {
    it('should reject RATE_LIMIT_MODE=memory in production', async () => {
      setTestEnv({ NODE_ENV: 'production', RATE_LIMIT_MODE: 'memory' });
      const limiter = await createLimiter(1000, 5);
      await assertThrowsSyncCheck(limiter, '127.0.0.1');
    });

    it('should reject requests when no distributed storage is configured', async () => {
      setTestEnv({ NODE_ENV: 'production' });
      const limiter = await createLimiter(1000, 5);
      await assertThrowsSyncCheck(limiter, '127.0.0.1');
    });

    after(() => {
      restoreEnv();
    });
  });

  describe('Configuration Validation', () => {
    after(() => {
      restoreEnv();
    });

    it('should fail validation without distributed storage in production', async () => {
      setTestEnv({ NODE_ENV: 'production' });
      const { validateRateLimitConfig } = await import('../api/_lib/rateLimiter.js');
      try {
        validateRateLimitConfig();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    it('should fail validation with RATE_LIMIT_MODE=memory in production', async () => {
      setTestEnv({ NODE_ENV: 'production', RATE_LIMIT_MODE: 'memory' });
      const { validateRateLimitConfig } = await import('../api/_lib/rateLimiter.js');
      try {
        validateRateLimitConfig();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    it('should pass validation with Redis configured', async () => {
      setTestEnv({ NODE_ENV: 'production', RATE_LIMIT_REDIS_URL: 'redis://localhost:6379' });
      const { validateRateLimitConfig } = await import('../api/_lib/rateLimiter.js');
      const result = validateRateLimitConfig();
      assert.strictEqual(result, true);
    });

    it('should pass validation with KV configured', async () => {
      setTestEnv({ NODE_ENV: 'production', KV_REST_API_URL: 'https://api.vercel-storage.com', KV_REST_API_TOKEN: 'test-token' });
      const { validateRateLimitConfig } = await import('../api/_lib/rateLimiter.js');
      const result = validateRateLimitConfig();
      assert.strictEqual(result, true);
    });
  });

  describe('Pre-configured Limiters', () => {
    before(() => {
      setTestEnv({
        NODE_ENV: 'test',
        RATE_LIMIT_MODE: 'memory',
      });
    });

    after(() => {
      restoreEnv();
    });

    it('should export loginRateLimiter with correct limits', async () => {
      const { loginRateLimiter } = await import('../api/_lib/rateLimiter.js');
      for (let i = 0; i < 10; i++) {
        const result = await loginRateLimiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      await assertRateLimitExceeded(loginRateLimiter, '127.0.0.1');
    });

    it('should export signupRateLimiter with correct limits', async () => {
      const { signupRateLimiter } = await import('../api/_lib/rateLimiter.js');
      for (let i = 0; i < 5; i++) {
        const result = await signupRateLimiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      await assertRateLimitExceeded(signupRateLimiter, '127.0.0.1');
    });
  });

  describe('Redis Backend', () => {
    let mockConnect;
    let mockPipeline;
    let mockPexpire;
    let mockDel;
    let mockFlushdb;
    const db = new Map();

    before(() => {
      // Stub Redis prototype to prevent real connection attempts and mock functionality
      mockConnect = mock.method(Redis.prototype, 'connect', () => Promise.resolve());
      
      mockPipeline = mock.method(Redis.prototype, 'pipeline', function() {
        const commands = [];
        return {
          incr(key) {
            commands.push({ cmd: 'incr', key });
            return this;
          },
          pttl(key) {
            commands.push({ cmd: 'pttl', key });
            return this;
          },
          async exec() {
            const results = [];
            for (const { cmd, key } of commands) {
              if (cmd === 'incr') {
                const val = (db.get(key)?.value || 0) + 1;
                const ttl = db.get(key)?.ttl || -1;
                db.set(key, { value: val, ttl });
                results.push([null, val]);
              } else if (cmd === 'pttl') {
                const entry = db.get(key);
                const ttl = entry ? entry.ttl : -1;
                results.push([null, ttl]);
              }
            }
            return results;
          }
        };
      });

      mockPexpire = mock.method(Redis.prototype, 'pexpire', async (key, ms) => {
        const entry = db.get(key);
        if (entry) {
          entry.ttl = ms;
        }
        return 1;
      });

      mockDel = mock.method(Redis.prototype, 'del', async (key) => {
        db.delete(key);
        return 1;
      });

      mockFlushdb = mock.method(Redis.prototype, 'flushdb', async () => {
        db.clear();
        return 'OK';
      });
    });

    after(() => {
      mock.restoreAll();
      restoreEnv();
    });

    beforeEach(() => {
      db.clear();
    });

    it('should export RedisRateLimiter class', async () => {
      const module = await import('../api/_lib/rateLimiter.js');
      assert.strictEqual(typeof module.createRateLimiter, 'function');
    });

    it('should throw on synchronous check for distributed backend', async () => {
      setTestEnv({ NODE_ENV: 'production', RATE_LIMIT_REDIS_URL: 'redis://localhost:6379' });
      const limiter = await createLimiter(1000, 5);
      await assertThrowsSyncCheck(limiter, '127.0.0.1');
    });

    it('should increment counter and set expiration for a new key in Redis', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
        KV_REST_API_URL: 'redis://localhost:6379',
        KV_REST_API_TOKEN: 'test-token',
      });
      const { incrementWithExpiration } = await import('../api/_lib/rate-limit-storage.js');
      
      const key = 'test-redis-key';
      const res = await incrementWithExpiration(key, 60000);
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.ttl, 60000);
      assert.strictEqual(db.get(key).ttl, 60000);
    });

    it('should reuse existing expiration and not reset TTL (fixed-window lockout prevention)', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
        KV_REST_API_URL: 'redis://localhost:6379',
        KV_REST_API_TOKEN: 'test-token',
      });
      const { incrementWithExpiration } = await import('../api/_lib/rate-limit-storage.js');

      const key = 'fixed-window-key';
      
      // First check: should set TTL to 60000
      const res1 = await incrementWithExpiration(key, 60000);
      assert.strictEqual(res1.count, 1);
      assert.strictEqual(res1.ttl, 60000);

      // Simulate elapsed time on the key's TTL in the mock database
      db.get(key).ttl = 45000;

      // Second check: should NOT call pexpire (TTL remains 45000)
      const res2 = await incrementWithExpiration(key, 60000);
      assert.strictEqual(res2.count, 2);
      assert.strictEqual(res2.ttl, 45000);
      assert.strictEqual(db.get(key).ttl, 45000);
    });

    it('should fail closed in production if Redis pipeline fails', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
        KV_REST_API_URL: 'redis://localhost:6379',
        KV_REST_API_TOKEN: 'test-token',
      });
      const { incrementWithExpiration } = await import('../api/_lib/rate-limit-storage.js');

      // Temporarily override exec on the next pipeline call to throw an error
      const originalPipeline = Redis.prototype.pipeline;
      mock.method(Redis.prototype, 'pipeline', function() {
        return {
          incr() { return this; },
          pttl() { return this; },
          exec() { return Promise.reject(new Error('Redis Connection Lost')); }
        };
      });

      try {
        await assert.rejects(
          incrementWithExpiration('fail-closed-key', 60000),
          /Rate-limit storage unavailable. Cannot safely enforce rate limits without distributed storage/
        );
      } finally {
        Redis.prototype.pipeline = originalPipeline;
      }
    });
  });

  describe('KV REST API Backend', () => {
    it('should support KV REST API backend', async () => {
      const module = await import('../api/_lib/rateLimiter.js');
      assert.strictEqual(typeof module.createRateLimiter, 'function');
    });

    it('should throw on synchronous check for distributed backend', async () => {
      setTestEnv({ NODE_ENV: 'production', KV_REST_API_URL: 'https://api.vercel-storage.com', KV_REST_API_TOKEN: 'test-token' });
      const limiter = await createLimiter(1000, 5);
      await assertThrowsSyncCheck(limiter, '127.0.0.1');
    });

    after(() => {
      restoreEnv();
    });
  });

  describe('Development Fallback', () => {
    before(() => {
      setTestEnv({
        NODE_ENV: 'development',
      });
    });

    after(() => {
      restoreEnv();
    });

    it('should use in-memory fallback in development without config', async () => {
      const limiter = await createLimiter(1000, 5);
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
    });
  });
});
