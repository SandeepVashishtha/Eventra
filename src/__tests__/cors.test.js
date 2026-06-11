/**
 * Security tests for CORS origin validation in authentication endpoints.
 *
 * Tests verify:
 * - Wildcard CORS is completely removed
 * - Only trusted origins are reflected in Access-Control-Allow-Origin
 * - Untrusted origins are denied
 * - Vary: Origin header is present
 * - Preflight requests use same validation logic
 * - Missing origin headers are handled correctly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildCorsHeaders,
  corsResponse,
  handlePreflight,
  getAllowedOrigins,
  normalizeOrigin,
  isOriginAllowed,
} from '../../api/auth/cors.js';

describe('CORS Origin Validation Security Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('normalizeOrigin', () => {
    it('should normalize valid origins correctly', () => {
      expect(normalizeOrigin('https://example.com')).toBe('https://example.com');
      expect(normalizeOrigin('https://example.com/')).toBe('https://example.com');
      expect(normalizeOrigin('https://example.com/path')).toBe('https://example.com');
      expect(normalizeOrigin('https://example.com:443/path?query=1')).toBe('https://example.com');
    });

    it('should handle origins with ports', () => {
      expect(normalizeOrigin('http://localhost:3000')).toBe('http://localhost:3000');
      expect(normalizeOrigin('http://localhost:5173/api')).toBe('http://localhost:5173');
      expect(normalizeOrigin('https://example.com:8080')).toBe('https://example.com:8080');
    });

    it('should return null for invalid origins', () => {
      expect(normalizeOrigin(null)).toBeNull();
      expect(normalizeOrigin(undefined)).toBeNull();
      expect(normalizeOrigin('')).toBeNull();
      expect(normalizeOrigin('not-a-url')).toBeNull();
      expect(normalizeOrigin('javascript:alert(1)')).toBeNull();
    });

    it('should trim whitespace', () => {
      expect(normalizeOrigin('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('getAllowedOrigins', () => {
    it('should extract origins from ALLOWED_ORIGINS env var', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com,https://another.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://trusted.example.com')).toBe(true);
      expect(origins.has('https://another.example.com')).toBe(true);
    });

    it('should extract origins from VITE_API_URL', () => {
      process.env.VITE_API_URL = 'https://api.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://api.example.com')).toBe(true);
    });

    it('should extract origins from BACKEND_URL', () => {
      process.env.BACKEND_URL = 'https://backend.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://backend.example.com')).toBe(true);
    });

    it('should extract origins from REACT_APP_API_URL', () => {
      process.env.REACT_APP_API_URL = 'https://react.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://react.example.com')).toBe(true);
    });

    it('should extract origins from REACT_APP_PUBLIC_URL', () => {
      process.env.REACT_APP_PUBLIC_URL = 'https://public.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://public.example.com')).toBe(true);
    });

    it('should add localhost ports in development', () => {
      process.env.NODE_ENV = 'development';
      const origins = getAllowedOrigins();
      expect(origins.has('http://localhost:3000')).toBe(true);
      expect(origins.has('http://localhost:5173')).toBe(true);
      expect(origins.has('http://localhost:8080')).toBe(true);
    });

    it('should not add localhost ports in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('http://localhost:3000')).toBe(false);
      expect(origins.has('https://example.com')).toBe(true);
    });

    it('should ignore invalid URLs silently', () => {
      process.env.ALLOWED_ORIGINS = 'https://valid.com,not-a-url,https://another-valid.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://valid.com')).toBe(true);
      expect(origins.has('https://another-valid.com')).toBe(true);
      expect(origins.has('not-a-url')).toBe(false);
    });

    it('should prioritize ALLOWED_ORIGINS over other env vars', () => {
      process.env.ALLOWED_ORIGINS = 'https://explicit.example.com';
      process.env.VITE_API_URL = 'https://api.example.com';
      const origins = getAllowedOrigins();
      expect(origins.has('https://explicit.example.com')).toBe(true);
      expect(origins.has('https://api.example.com')).toBe(true);
    });
  });

  describe('isOriginAllowed', () => {
    it('should return true for allowed origins', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      expect(isOriginAllowed('https://trusted.example.com')).toBe(true);
    });

    it('should return false for untrusted origins', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      expect(isOriginAllowed('https://attacker.example.com')).toBe(false);
    });

    it('should return false for missing origin header', () => {
      expect(isOriginAllowed(null)).toBe(false);
      expect(isOriginAllowed(undefined)).toBe(false);
    });

    it('should return false for invalid origins', () => {
      expect(isOriginAllowed('not-a-url')).toBe(false);
      expect(isOriginAllowed('javascript:alert(1)')).toBe(false);
    });

    it('should handle origins with paths correctly', () => {
      process.env.ALLOWED_ORIGINS = 'https://example.com';
      expect(isOriginAllowed('https://example.com/path')).toBe(true);
    });

    it('should handle origins with ports correctly', () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('http://localhost:3001')).toBe(false);
    });
  });

  describe('buildCorsHeaders', () => {
    it('should reflect allowed origin in Access-Control-Allow-Origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://trusted.example.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://trusted.example.com');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should NOT reflect untrusted origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://attacker.example.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    it('should NOT return wildcard origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://attacker.example.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).not.toBe('*');
    });

    it('should include Vary: Origin header', () => {
      const req = { headers: { origin: 'https://example.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Vary']).toBe('Origin');
    });

    it('should include standard CORS methods and headers', () => {
      const req = { headers: {} };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
    });

    it('should handle missing origin header', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: {} };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    it('should handle development localhost origins', () => {
      process.env.NODE_ENV = 'development';
      const req = { headers: { origin: 'http://localhost:3000' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    });
  });

  describe('corsResponse', () => {
    it('should apply CORS headers and send response', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://trusted.example.com' } };
      const setHeaderCalls = [];
      const statusCalls = [];
      const jsonCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { statusCalls.push(code); return res; },
        json: (body) => jsonCalls.push(body),
      };
      
      corsResponse(req, res, 200, { message: 'success' });
      
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Origin' && call[1] === 'https://trusted.example.com')).toBe(true);
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Methods' && call[1] === 'GET, POST, PUT, DELETE, OPTIONS')).toBe(true);
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Headers' && call[1] === 'Content-Type, Authorization')).toBe(true);
      expect(setHeaderCalls.some(call => call[0] === 'Vary' && call[1] === 'Origin')).toBe(true);
      expect(statusCalls[0]).toBe(200);
      expect(jsonCalls[0]).toEqual({ message: 'success' });
    });

    it('should not reflect untrusted origin in response', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://attacker.example.com' } };
      const setHeaderCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { return res; },
        json: (body) => {},
      };
      
      corsResponse(req, res, 401, { error: 'Unauthorized' });
      
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Origin' && call[1] === 'https://attacker.example.com')).toBe(false);
    });
  });

  describe('handlePreflight', () => {
    it('should handle OPTIONS requests with allowed origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://trusted.example.com' } };
      const setHeaderCalls = [];
      const statusCalls = [];
      const endCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { statusCalls.push(code); return res; },
        end: () => endCalls.push(true),
      };
      
      handlePreflight(req, res);
      
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Origin' && call[1] === 'https://trusted.example.com')).toBe(true);
      expect(statusCalls[0]).toBe(204);
      expect(endCalls.length).toBe(1);
    });

    it('should handle OPTIONS requests with untrusted origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://attacker.example.com' } };
      const setHeaderCalls = [];
      const statusCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { statusCalls.push(code); return res; },
        end: () => {},
      };
      
      handlePreflight(req, res);
      
      expect(setHeaderCalls.some(call => call[0] === 'Access-Control-Allow-Origin' && call[1] === 'https://attacker.example.com')).toBe(false);
      expect(statusCalls[0]).toBe(204);
    });

    it('should include Vary: Origin in preflight response', () => {
      const req = { headers: { origin: 'https://example.com' } };
      const setHeaderCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { return res; },
        end: () => {},
      };
      
      handlePreflight(req, res);
      
      expect(setHeaderCalls.some(call => call[0] === 'Vary' && call[1] === 'Origin')).toBe(true);
    });
  });

  describe('Security: No Wildcard Origins', () => {
    it('should never return wildcard origin in buildCorsHeaders', () => {
      process.env.ALLOWED_ORIGINS = '';
      const req = { headers: { origin: 'https://any-origin.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).not.toBe('*');
    });

    it('should never return wildcard origin in corsResponse', () => {
      process.env.ALLOWED_ORIGINS = '';
      const req = { headers: { origin: 'https://any-origin.com' } };
      const setHeaderCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { return res; },
        json: (body) => {},
      };
      
      corsResponse(req, res, 200, {});
      
      const allowOriginCall = setHeaderCalls.find(call => call[0] === 'Access-Control-Allow-Origin');
      
      if (allowOriginCall) {
        expect(allowOriginCall[1]).not.toBe('*');
      }
    });

    it('should never return wildcard origin in handlePreflight', () => {
      process.env.ALLOWED_ORIGINS = '';
      const req = { headers: { origin: 'https://any-origin.com' } };
      const setHeaderCalls = [];
      const res = {
        setHeader: (key, value) => setHeaderCalls.push([key, value]),
        status: (code) => { return res; },
        end: () => {},
      };
      
      handlePreflight(req, res);
      
      const allowOriginCall = setHeaderCalls.find(call => call[0] === 'Access-Control-Allow-Origin');
      
      if (allowOriginCall) {
        expect(allowOriginCall[1]).not.toBe('*');
      }
    });
  });

  describe('Security: Origin Reflection Prevention', () => {
    it('should not reflect arbitrary origins without validation', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const testOrigins = [
        'https://attacker.example.com',
        'https://malicious.com',
        'https://phishing-site.com',
        'http://evil.com',
      ];
      
      testOrigins.forEach(origin => {
        const req = { headers: { origin } };
        const headers = buildCorsHeaders(req);
        
        expect(headers['Access-Control-Allow-Origin']).not.toBe(origin);
      });
    });

    it('should only reflect origins that match allowlist exactly', () => {
      process.env.ALLOWED_ORIGINS = 'https://trusted.example.com';
      const req = { headers: { origin: 'https://trusted.example.com' } };
      const headers = buildCorsHeaders(req);
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://trusted.example.com');
    });
  });
});
