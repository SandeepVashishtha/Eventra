/**
 * src/__tests__/session-risk-config.test.js
 *
 * Tests for session-risk configuration module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isSessionRiskStorageConfigured,
  isInMemorySessionRiskStorageAllowed,
  getSessionRiskFailMode,
  assertSessionRiskStorageConfigured,
} from '../../api/_lib/session-risk-config.js';

describe('session-risk-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('isSessionRiskStorageConfigured', () => {
    it('returns true when both KV_REST_API_URL and KV_REST_API_TOKEN are set', () => {
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(isSessionRiskStorageConfigured()).toBe(true);
    });

    it('returns false when KV_REST_API_URL is missing', () => {
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when KV_REST_API_TOKEN is missing', () => {
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when both are missing', () => {
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when KV_REST_API_URL is empty string', () => {
      process.env.KV_REST_API_URL = '';
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when KV_REST_API_TOKEN is empty string', () => {
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      process.env.KV_REST_API_TOKEN = '';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when KV_REST_API_URL is whitespace only', () => {
      process.env.KV_REST_API_URL = '   ';
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });

    it('returns false when KV_REST_API_TOKEN is whitespace only', () => {
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      process.env.KV_REST_API_TOKEN = '   ';
      expect(isSessionRiskStorageConfigured()).toBe(false);
    });
  });

  describe('isInMemorySessionRiskStorageAllowed', () => {
    it('returns false in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isInMemorySessionRiskStorageAllowed()).toBe(false);
    });

    it('returns true in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isInMemorySessionRiskStorageAllowed()).toBe(true);
    });

    it('returns true in test', () => {
      process.env.NODE_ENV = 'test';
      expect(isInMemorySessionRiskStorageAllowed()).toBe(true);
    });

    it('returns true when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(isInMemorySessionRiskStorageAllowed()).toBe(true);
    });
  });

  describe('getSessionRiskFailMode', () => {
    it('returns "fallback" when SESSION_RISK_FAIL_MODE is not set', () => {
      delete process.env.SESSION_RISK_FAIL_MODE;
      expect(getSessionRiskFailMode()).toBe('fallback');
    });

    it('returns "fallback" when SESSION_RISK_FAIL_MODE is "fallback"', () => {
      process.env.SESSION_RISK_FAIL_MODE = 'fallback';
      expect(getSessionRiskFailMode()).toBe('fallback');
    });

    it('returns "open" when SESSION_RISK_FAIL_MODE is "open"', () => {
      process.env.SESSION_RISK_FAIL_MODE = 'open';
      expect(getSessionRiskFailMode()).toBe('open');
    });

    it('returns "closed" when SESSION_RISK_FAIL_MODE is "closed"', () => {
      process.env.SESSION_RISK_FAIL_MODE = 'closed';
      expect(getSessionRiskFailMode()).toBe('closed');
    });

    it('returns "fallback" when SESSION_RISK_FAIL_MODE is invalid', () => {
      process.env.SESSION_RISK_FAIL_MODE = 'invalid-mode';
      expect(getSessionRiskFailMode()).toBe('fallback');
    });

    it('handles case-insensitive input', () => {
      process.env.SESSION_RISK_FAIL_MODE = 'FALLBACK';
      expect(getSessionRiskFailMode()).toBe('fallback');
      
      process.env.SESSION_RISK_FAIL_MODE = 'OPEN';
      expect(getSessionRiskFailMode()).toBe('open');
      
      process.env.SESSION_RISK_FAIL_MODE = 'CLOSED';
      expect(getSessionRiskFailMode()).toBe('closed');
    });

    it('trims whitespace from input', () => {
      process.env.SESSION_RISK_FAIL_MODE = '  fallback  ';
      expect(getSessionRiskFailMode()).toBe('fallback');
    });
  });

  describe('assertSessionRiskStorageConfigured', () => {
    it('does not throw when storage is configured in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(() => assertSessionRiskStorageConfigured()).not.toThrow();
    });

    it('does not throw when storage is not configured in development', () => {
      process.env.NODE_ENV = 'development';
      expect(() => assertSessionRiskStorageConfigured()).not.toThrow();
    });

    it('does not throw when storage is not configured in test', () => {
      process.env.NODE_ENV = 'test';
      expect(() => assertSessionRiskStorageConfigured()).not.toThrow();
    });

    it('throws when storage is not configured in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
      expect(() => assertSessionRiskStorageConfigured()).toThrow(
        'KV_REST_API_URL and KV_REST_API_TOKEN are required in production for session-risk storage'
      );
    });

    it('throws when only KV_REST_API_URL is set in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.KV_REST_API_URL = 'https://api.kv.example.com';
      delete process.env.KV_REST_API_TOKEN;
      expect(() => assertSessionRiskStorageConfigured()).toThrow(
        'KV_REST_API_URL and KV_REST_API_TOKEN are required in production for session-risk storage'
      );
    });

    it('throws when only KV_REST_API_TOKEN is set in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.KV_REST_API_URL;
      process.env.KV_REST_API_TOKEN = 'secret-token';
      expect(() => assertSessionRiskStorageConfigured()).toThrow(
        'KV_REST_API_URL and KV_REST_API_TOKEN are required in production for session-risk storage'
      );
    });
  });
});
