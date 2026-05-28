/**
 * Tests for src/utils/oauthState.js
 *
 * Verifies the CSRF state nonce generation, storage, validation,
 * and the security invariants required by RFC 6749 §10.12.
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// ---------------------------------------------------------------------------
// sessionStorage mock
// ---------------------------------------------------------------------------

class SessionStorageMock {
  constructor() { this._store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; }
  setItem(k, v) { this._store[k] = String(v); }
  removeItem(k) { delete this._store[k]; }
  clear() { this._store = {}; }
}

const mockSession = new SessionStorageMock();
global.sessionStorage = mockSession;

// Web Crypto stub (deterministic for testing)
let _counter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (_counter++ * 37 + i * 13) % 256;
      }
      return arr;
    },
  },
  writable: true,
  configurable: true,
});

// ---------------------------------------------------------------------------
// Module under test
// ---------------------------------------------------------------------------

const {
  generateOAuthState,
  validateOAuthState,
  clearOAuthState,
  hasStoredOAuthState,
} = await import('../src/utils/oauthState.js');

const STORAGE_KEY = 'eventra:oauth:state';

// ---------------------------------------------------------------------------
// generateOAuthState
// ---------------------------------------------------------------------------

describe('generateOAuthState', () => {
  beforeEach(() => mockSession.clear());

  it('returns a non-empty string', () => {
    const nonce = generateOAuthState();
    assert.ok(typeof nonce === 'string' && nonce.length > 0);
  });

  it('stores the nonce in sessionStorage under the correct key', () => {
    const nonce = generateOAuthState();
    assert.strictEqual(mockSession.getItem(STORAGE_KEY), nonce);
  });

  it('generates a new nonce each call (values differ)', () => {
    const a = generateOAuthState();
    mockSession.clear();
    const b = generateOAuthState();
    assert.notStrictEqual(a, b, 'Each OAuth flow should have a unique nonce');
  });

  it('produces a URL-safe string (no +, /, = padding)', () => {
    for (let i = 0; i < 20; i++) {
      mockSession.clear();
      const nonce = generateOAuthState();
      assert.ok(!/[+/=]/.test(nonce), `Nonce must be URL-safe: got "${nonce}"`);
    }
  });

  it('nonce is at least 32 characters long', () => {
    const nonce = generateOAuthState();
    assert.ok(nonce.length >= 32, `Expected nonce length >= 32, got ${nonce.length}`);
  });
});

// ---------------------------------------------------------------------------
// validateOAuthState — happy path
// ---------------------------------------------------------------------------

describe('validateOAuthState — valid state', () => {
  beforeEach(() => mockSession.clear());

  it('returns { valid: true } when received state matches stored nonce', () => {
    const nonce = generateOAuthState();
    const result = validateOAuthState(nonce);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.reason, '');
  });

  it('clears the stored nonce after successful validation (one-time use)', () => {
    const nonce = generateOAuthState();
    validateOAuthState(nonce);
    assert.strictEqual(mockSession.getItem(STORAGE_KEY), null, 'Nonce must be removed after use');
  });
});

// ---------------------------------------------------------------------------
// validateOAuthState — attack scenarios
// ---------------------------------------------------------------------------

describe('validateOAuthState — CSRF attack scenarios', () => {
  beforeEach(() => mockSession.clear());

  it('rejects a callback with no state parameter (missing state)', () => {
    generateOAuthState();
    const result = validateOAuthState(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.reason.length > 0);
  });

  it('rejects a callback with an empty state string', () => {
    generateOAuthState();
    const result = validateOAuthState('');
    assert.strictEqual(result.valid, false);
  });

  it('rejects a callback with a mismatched state (attacker nonce)', () => {
    generateOAuthState(); // victim initiates flow, nonce stored
    const attackerNonce = 'totally-different-attacker-nonce-abc123';
    const result = validateOAuthState(attackerNonce);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.reason.toLowerCase().includes('mismatch') ||
        result.reason.toLowerCase().includes('csrf') ||
        result.reason.length > 0,
    );
  });

  it('rejects a callback when no flow was initiated (no stored nonce)', () => {
    // No generateOAuthState() call — simulates a forged direct URL navigation
    const result = validateOAuthState('any-state-value');
    assert.strictEqual(result.valid, false);
    assert.ok(result.reason.length > 0);
  });

  it('rejects a second callback with the same nonce (replay attack)', () => {
    const nonce = generateOAuthState();

    // First use — should succeed
    const first = validateOAuthState(nonce);
    assert.strictEqual(first.valid, true, 'First use should succeed');

    // Second use with the same nonce — nonce already consumed
    const second = validateOAuthState(nonce);
    assert.strictEqual(second.valid, false, 'Replay of same nonce must be rejected');
  });

  it('rejects after clearOAuthState() cancels the flow', () => {
    generateOAuthState(); // flow started
    clearOAuthState();    // user cancelled or navigated away

    const result = validateOAuthState('any-nonce');
    assert.strictEqual(result.valid, false);
  });

  it('clears stored nonce even on validation failure (no nonce reuse on error)', () => {
    generateOAuthState();
    validateOAuthState('wrong-nonce');
    assert.strictEqual(mockSession.getItem(STORAGE_KEY), null, 'Nonce must be cleared even on failure');
  });
});

// ---------------------------------------------------------------------------
// clearOAuthState
// ---------------------------------------------------------------------------

describe('clearOAuthState', () => {
  beforeEach(() => mockSession.clear());

  it('removes the stored nonce', () => {
    generateOAuthState();
    clearOAuthState();
    assert.strictEqual(mockSession.getItem(STORAGE_KEY), null);
  });

  it('does not throw when no nonce is stored', () => {
    assert.doesNotThrow(() => clearOAuthState());
  });
});

// ---------------------------------------------------------------------------
// hasStoredOAuthState
// ---------------------------------------------------------------------------

describe('hasStoredOAuthState', () => {
  beforeEach(() => mockSession.clear());

  it('returns false when no flow has been initiated', () => {
    assert.strictEqual(hasStoredOAuthState(), false);
  });

  it('returns true after generateOAuthState()', () => {
    generateOAuthState();
    assert.strictEqual(hasStoredOAuthState(), true);
  });

  it('returns false after validateOAuthState()', () => {
    const nonce = generateOAuthState();
    validateOAuthState(nonce);
    assert.strictEqual(hasStoredOAuthState(), false);
  });

  it('returns false after clearOAuthState()', () => {
    generateOAuthState();
    clearOAuthState();
    assert.strictEqual(hasStoredOAuthState(), false);
  });
});

// ---------------------------------------------------------------------------
// OAuthCallback source — static analysis
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const callbackSrc = readFileSync(
  path.resolve(__dirname, '../src/components/auth/OAuthCallback.jsx'),
  'utf8',
);

describe('OAuthCallback.jsx — state validation wired correctly', () => {
  it('imports validateOAuthState from oauthState utils', () => {
    assert.ok(
      callbackSrc.includes('validateOAuthState'),
      'OAuthCallback must import and call validateOAuthState',
    );
  });

  it('reads the state parameter from the URL', () => {
    assert.ok(
      callbackSrc.includes("params.get('state')") || callbackSrc.includes('params.get("state")'),
      'OAuthCallback must read the state parameter from the URL',
    );
  });

  it('navigates to /login when state validation fails', () => {
    assert.ok(
      callbackSrc.includes("navigate('/login'") || callbackSrc.includes('navigate("/login"'),
      'OAuthCallback must redirect to /login on state validation failure',
    );
  });

  it('does not blindly accept any token without state check', () => {
    const hasGuard =
      callbackSrc.includes('validateOAuthState') &&
      callbackSrc.includes('stateResult.valid');
    assert.ok(hasGuard, 'OAuthCallback must check stateResult.valid before accepting the token');
  });
});
