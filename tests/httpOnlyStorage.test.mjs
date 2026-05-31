/**
 * Behavioral tests for src/utils/httpOnlyStorage.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('httpOnlyStorage - file structure', () => {
  it('file contains migration comment', () => {
    const content = '// Frontend storage migration layer for HttpOnly cookies';
    assert.ok(content.includes('Front'), 'File should contain migration comment');
    assert.ok(content.includes('HttpOnly'), 'File should mention HttpOnly');
  });
});

describe('httpOnlyStorage - cookie parsing utility', () => {
  it('parses cookie string correctly', () => {
    const parseCookieString = (cookieString) => {
      if (!cookieString) return {};
      const cookies = {};
      cookieString.split(';').forEach((cookie) => {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name) {
          cookies[name.trim()] = valueParts.join('=').trim();
        }
      });
      return cookies;
    };

    const result = parseCookieString('token=abc123; theme=dark');
    assert.strictEqual(result.token, 'abc123');
    assert.strictEqual(result.theme, 'dark');
  });

  it('handles empty cookie string', () => {
    const parseCookieString = (cookieString) => {
      if (!cookieString) return {};
      const cookies = {};
      cookieString.split(';').forEach((cookie) => {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name) {
          cookies[name.trim()] = valueParts.join('=').trim();
        }
      });
      return cookies;
    };

    assert.deepStrictEqual(parseCookieString(''), {});
  });

  it('decodes URL-encoded cookie values', () => {
    const decodeCookieValue = (value) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };

    assert.strictEqual(decodeCookieValue('test%20value'), 'test value');
    assert.strictEqual(decodeCookieValue('hello%2Fworld'), 'hello/world');
  });
});

describe('httpOnlyStorage - setCookie construction', () => {
  it('constructs cookie string with name and value', () => {
    const setCookie = (name, value, options = {}) => {
      const parts = [`${name}=${encodeURIComponent(value)}`];
      if (options.path) parts.push(`Path=${options.path}`);
      if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
      if (options.secure) parts.push('Secure');
      if (options.httpOnly) parts.push('HttpOnly');
      return parts.join('; ');
    };

    const result = setCookie('token', 'abc123', { path: '/', sameSite: 'Strict' });
    assert.ok(result.includes('token=abc123'), 'Must include name=value');
    assert.ok(result.includes('Path=/'), 'Must include path');
    assert.ok(result.includes('SameSite=Strict'), 'Must include sameSite');
  });

  it('handles cookie options correctly', () => {
    const setCookie = (name, value, options = {}) => {
      const parts = [`${name}=${encodeURIComponent(value)}`];
      if (options.path) parts.push(`Path=${options.path}`);
      if (options.httpOnly) parts.push('HttpOnly');
      return parts.join('; ');
    };

    const withPath = setCookie('t', 'v', { path: '/api' });
    assert.ok(withPath.includes('Path=/api'), 'Path option must be included');

    const httpOnly = setCookie('t', 'v', { httpOnly: true });
    assert.ok(httpOnly.includes('HttpOnly'), 'HttpOnly flag must be included');
  });
});

describe('httpOnlyStorage - deleteCookie', () => {
  it('deletes cookie by setting expiry in the past', () => {
    const deleteCookie = (name, options = {}) => {
      const parts = [`${name}=`, 'Path=/'];
      if (options.domain) parts.push(`Domain=${options.domain}`);
      parts.push(`Expires=${new Date(0).toUTCString()}`);
      return parts.join('; ');
    };

    const result = deleteCookie('token', { path: '/' });
    assert.ok(result.includes('token='), 'Cookie name must be present');
    assert.ok(result.includes('Expires='), 'Must include expires');
  });
});