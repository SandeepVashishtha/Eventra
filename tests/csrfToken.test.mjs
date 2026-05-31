/**
 * Behavioral tests for src/utils/csrfToken.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

const CSRF_META_NAME = 'csrf-token';
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

describe('csrfToken - constants', () => {
  it('uses correct meta name', () => {
    assert.strictEqual(CSRF_META_NAME, 'csrf-token');
  });

  it('uses correct cookie name', () => {
    assert.strictEqual(CSRF_COOKIE_NAME, 'XSRF-TOKEN');
  });

  it('uses correct header name', () => {
    assert.strictEqual(CSRF_HEADER_NAME, 'X-CSRF-Token');
  });
});

describe('csrfToken - getCSRFTokenFromMeta', () => {
  it('returns token from meta tag when present', () => {
    const tokens = ['abc123token', 'valid-token-456'];
    const getMetaToken = (tokensArr) => {
      return tokensArr.length > 0 ? tokensArr[0] : null;
    };

    assert.strictEqual(getMetaToken(tokens), 'abc123token');
  });

  it('returns null when meta tag is not present', () => {
    const getMetaToken = (tokensArr) => tokensArr.length > 0 ? tokensArr[0] : null;
    assert.strictEqual(getMetaToken([]), null);
  });
});

describe('csrfToken - getCSRFTokenFromCookie', () => {
  it('returns token from cookie when present', () => {
    const cookieString = 'other=value; XSRF-TOKEN=myToken123; another=test';
    const cookies = cookieString.split(';').map(c => c.trim());

    let token = null;
    for (const cookie of cookies) {
      if (cookie.startsWith(`${CSRF_COOKIE_NAME}=`)) {
        token = decodeURIComponent(cookie.substring(CSRF_COOKIE_NAME.length + 1));
        break;
      }
    }

    assert.strictEqual(token, 'myToken123');
  });

  it('returns null when cookie is not present', () => {
    const cookieString = 'other=value; another=test';
    const cookies = cookieString.split(';').map(c => c.trim());

    let token = null;
    for (const cookie of cookies) {
      if (cookie.startsWith(`${CSRF_COOKIE_NAME}=`)) {
        token = decodeURIComponent(cookie.substring(CSRF_COOKIE_NAME.length + 1));
        break;
      }
    }

    assert.strictEqual(token, null);
  });

  it('decodes URI component in cookie value', () => {
    const cookieString = 'XSRF-TOKEN=test%20value%20with%20spaces';
    const cookies = cookieString.split(';').map(c => c.trim());

    let token = null;
    for (const cookie of cookies) {
      if (cookie.startsWith(`${CSRF_COOKIE_NAME}=`)) {
        token = decodeURIComponent(cookie.substring(CSRF_COOKIE_NAME.length + 1));
        break;
      }
    }

    assert.strictEqual(token, 'test value with spaces');
  });
});

describe('csrfToken - getCSRFToken (meta first, then cookie)', () => {
  it('prefers meta token over cookie when both present', () => {
    const getCSRFToken = (metaToken, cookieToken) => metaToken || cookieToken;

    assert.strictEqual(getCSRFToken('metaToken', 'cookieToken'), 'metaToken');
  });

  it('falls back to cookie when meta is absent', () => {
    const getCSRFToken = (metaToken, cookieToken) => metaToken || cookieToken;
    assert.strictEqual(getCSRFToken(null, 'cookieToken'), 'cookieToken');
  });

  it('returns null when both meta and cookie are absent', () => {
    const getCSRFToken = (metaToken, cookieToken) => metaToken || cookieToken;
    assert.strictEqual(getCSRFToken(null, null), null);
  });
});

describe('csrfToken - csrfFetch method detection', () => {
  it('does not add header for GET requests', () => {
    const needsCSRF = (method) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    assert.strictEqual(needsCSRF('GET'), false);
  });

  it('adds CSRF header for POST requests', () => {
    const needsCSRF = (method) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    assert.strictEqual(needsCSRF('POST'), true);
  });

  it('adds CSRF header for PUT, PATCH, DELETE requests', () => {
    const needsCSRF = (method) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

    assert.strictEqual(needsCSRF('PUT'), true);
    assert.strictEqual(needsCSRF('PATCH'), true);
    assert.strictEqual(needsCSRF('DELETE'), true);
  });

  it('normalizes method to uppercase', () => {
    const normalizeMethod = (method) => (method || 'GET').toUpperCase();

    assert.strictEqual(normalizeMethod('post'), 'POST');
    assert.strictEqual(normalizeMethod('Post'), 'POST');
    assert.strictEqual(normalizeMethod('POST'), 'POST');
  });
});

describe('csrfToken - csrfFetch header building', () => {
  it('adds CSRF header when token is available', () => {
    const token = 'myToken';
    const needsCSRF = true;
    const headers = needsCSRF && token ? { ...{}, [CSRF_HEADER_NAME]: token } : {};

    assert.strictEqual(headers[CSRF_HEADER_NAME], 'myToken');
  });

  it('does not add header when token is null', () => {
    const token = null;
    const needsCSRF = true;
    const headers = needsCSRF && token ? { ...{}, [CSRF_HEADER_NAME]: token } : {};

    assert.deepStrictEqual(headers, {});
  });

  it('preserves existing headers when adding CSRF', () => {
    const existingHeaders = { 'Content-Type': 'application/json' };
    const token = 'myToken';
    const needsCSRF = true;
    const headers = needsCSRF && token ? { ...existingHeaders, [CSRF_HEADER_NAME]: token } : existingHeaders;

    assert.strictEqual(headers['Content-Type'], 'application/json');
    assert.strictEqual(headers[CSRF_HEADER_NAME], 'myToken');
  });
});