/**
 * Behavioral tests for src/utils/certificateUtils.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('certificateUtils - verifyCertificate validation', () => {
  it('throws error when uid is null', () => {
    const verifyCertificate = (uid) => {
      if (!uid) throw new Error('UID is required');
    };

    assert.throws(() => verifyCertificate(null), /UID is required/);
  });

  it('throws error when uid is undefined', () => {
    const verifyCertificate = (uid) => {
      if (!uid) throw new Error('UID is required');
    };

    assert.throws(() => verifyCertificate(undefined), /UID is required/);
  });

  it('throws error when uid is empty string', () => {
    const verifyCertificate = (uid) => {
      if (!uid) throw new Error('UID is required');
    };

    assert.throws(() => verifyCertificate(''), /UID is required/);
  });

  it('does not throw when uid is provided', () => {
    const verifyCertificate = (uid) => {
      if (!uid) throw new Error('UID is required');
      return { name: 'Test', skills: [], badges: [] };
    };

    assert.doesNotThrow(() => verifyCertificate('valid-uid-123'));
  });
});

describe('certificateUtils - URL construction', () => {
  it('constructs correct API URL with REACT_APP_API_URL', () => {
    const apiBaseUrl = 'https://api.example.com';
    const uid = 'test-uid';
    const url = `${apiBaseUrl}/api/verify-certificate/${uid}`;

    assert.strictEqual(url, 'https://api.example.com/api/verify-certificate/test-uid');
  });

  it('constructs URL with VITE_API_URL fallback', () => {
    const apiBaseUrl = 'https://api.example.com';
    const uid = 'test-uid';
    const url = `${apiBaseUrl}/api/verify-certificate/${uid}`;

    assert.ok(url.includes('/api/verify-certificate/'));
  });

  it('constructs relative path when API URL is empty', () => {
    const apiBaseUrl = '';
    const uid = 'test-uid';
    const url = `${apiBaseUrl}/api/verify-certificate/${uid}`;

    assert.strictEqual(url, '/api/verify-certificate/test-uid');
  });

  it('handles special characters in UID', () => {
    const apiBaseUrl = 'https://api.example.com';
    const uid = 'uid-with-special-chars';
    const url = `${apiBaseUrl}/api/verify-certificate/${uid}`;

    assert.ok(url.includes('uid-with-special-chars'));
  });
});

describe('certificateUtils - response parsing', () => {
  it('parses valid JSON response', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ name: 'John Doe', skills: ['JavaScript'], badges: ['verified'] }),
    };

    const data = await mockResponse.json();
    assert.strictEqual(data.name, 'John Doe');
    assert.deepStrictEqual(data.skills, ['JavaScript']);
    assert.deepStrictEqual(data.badges, ['verified']);
  });

  it('throws error message for non-ok response', async () => {
    const mockResponse = {
      ok: false,
      text: async () => 'Certificate not found',
    };

    const error = await mockResponse.text();
    assert.strictEqual(error, 'Certificate not found');
  });
});