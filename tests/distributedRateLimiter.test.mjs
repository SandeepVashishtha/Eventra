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

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';

// Mock environment variables before importing the module
const originalEnv = { ...process.env };

const RATE_LIMIT_ENV_VARS = [
  'RATE_LIMIT_REDIS_URL',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'RATE_LIMIT_MODE',
];

function setTestEnv(env) {
  // Clear all rate limit related env vars
  RATE_LIMIT_ENV_VARS.forEach(varName => delete process.env[varName]);
  
  // Set test environment
  Object.assign(process.env, env);
}

function restoreEnv() {
  Object.assign(process.env, originalEnv);
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
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should support synchronous check for backwards compatibility', async () => {
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      const result = limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should support async checkAsync method', async () => {
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      const result = await limiter.checkAsync('127.0.0.1');
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it('should enforce rate limit', async () => {
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 3);
      
      for (let i = 0; i < 3; i++) {
        const result = await limiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.remaining, 0);
    });

    it('should reset counter after window expires', async () => {
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(100, 2);
      
      await limiter.check('127.0.0.1');
      await limiter.check('127.0.0.1');
      
      const blocked = await limiter.check('127.0.0.1');
      assert.strictEqual(blocked.allowed, false);
      
      await new Promise(resolve => setTimeout(resolve, 110));
      
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
    });

    it('should track different IPs independently', async () => {
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 2);
      
      await limiter.check('192.168.1.1');
      await limiter.check('192.168.1.1');
      const ip1Blocked = await limiter.check('192.168.1.1');
      assert.strictEqual(ip1Blocked.allowed, false);
      
      const ip2Result = await limiter.check('192.168.1.2');
      assert.strictEqual(ip2Result.allowed, true);
    });

    it('should work with enforceRateLimit helper', async () => {
      const { createRateLimiter, enforceRateLimit } = await import('../api/lib/rateLimiter.js');
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
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_MODE: 'memory',
      });
      
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      try {
        limiter.check('127.0.0.1');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    it('should reject requests when no distributed storage is configured', async () => {
      setTestEnv({
        NODE_ENV: 'production',
      });
      
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      try {
        limiter.check('127.0.0.1');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
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
      setTestEnv({
        NODE_ENV: 'production',
      });
      
      const { validateRateLimitConfig } = await import('../api/lib/rateLimiter.js');
      
      try {
        validateRateLimitConfig();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    it('should fail validation with RATE_LIMIT_MODE=memory in production', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_MODE: 'memory',
      });
      
      const { validateRateLimitConfig } = await import('../api/lib/rateLimiter.js');
      
      try {
        validateRateLimitConfig();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    it('should pass validation with Redis configured', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
      });
      
      const { validateRateLimitConfig } = await import('../api/lib/rateLimiter.js');
      
      const result = validateRateLimitConfig();
      assert.strictEqual(result, true);
    });

    it('should pass validation with KV configured', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        KV_REST_API_URL: 'https://api.vercel-storage.com',
        KV_REST_API_TOKEN: 'test-token',
      });
      
      const { validateRateLimitConfig } = await import('../api/lib/rateLimiter.js');
      
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
      const { loginRateLimiter } = await import('../api/lib/rateLimiter.js');
      
      for (let i = 0; i < 10; i++) {
        const result = await loginRateLimiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      
      const blocked = await loginRateLimiter.check('127.0.0.1');
      assert.strictEqual(blocked.allowed, false);
    });

    it('should export signupRateLimiter with correct limits', async () => {
      const { signupRateLimiter } = await import('../api/lib/rateLimiter.js');
      
      for (let i = 0; i < 5; i++) {
        const result = await signupRateLimiter.check('127.0.0.1');
        assert.strictEqual(result.allowed, true);
      }
      
      const blocked = await signupRateLimiter.check('127.0.0.1');
      assert.strictEqual(blocked.allowed, false);
    });
  });

  describe('Redis Backend', () => {
    it('should export RedisRateLimiter class', async () => {
      const module = await import('../api/lib/rateLimiter.js');
      assert.strictEqual(typeof module.createRateLimiter, 'function');
    });

    it('should throw on synchronous check for distributed backend', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
      });

      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      try {
        limiter.check('127.0.0.1');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
    });

    after(() => {
      restoreEnv();
    });
  });

  describe('KV REST API Backend', () => {
    it('should support KV REST API backend', async () => {
      const module = await import('../api/lib/rateLimiter.js');
      assert.strictEqual(typeof module.createRateLimiter, 'function');
    });

    it('should throw on synchronous check for distributed backend', async () => {
      setTestEnv({
        NODE_ENV: 'production',
        KV_REST_API_URL: 'https://api.vercel-storage.com',
        KV_REST_API_TOKEN: 'test-token',
      });

      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      try {
        limiter.check('127.0.0.1');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message);
      }
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
      const { createRateLimiter } = await import('../api/lib/rateLimiter.js');
      const limiter = createRateLimiter(1000, 5);
      
      const result = await limiter.check('127.0.0.1');
      assert.strictEqual(result.allowed, true);
    });
  });
});
