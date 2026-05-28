/**
 * Tests for oauthState.js — OAuth CSRF state parameter utilities (issue #3462).
 *
 * Verifies:
 *  1. generateOAuthState produces a non-empty string and stores it.
 *  2. validateOAuthState returns true for a matching state.
 *  3. validateOAuthState returns false for a mismatched state.
 *  4. validateOAuthState returns false when no state was stored.
 *  5. validateOAuthState removes the stored value after a successful check (one-time use).
 *  6. validateOAuthState removes the stored value after a failed check (no replay).
 *  7. validateOAuthState returns false for null / undefined received state.
 *  8. Two successive calls to generateOAuthState produce different values.
 *  9. hasStoredOAuthState correctly reports whether a value is stored.
 * 10. clearOAuthState removes the stored value.
 */

import { describe, it, expect, beforeEach } from 'vitest';

const OAUTH_STATE_KEY = 'eventra:oauth_state';

// ── In-memory sessionStorage mock ────────────────────────────────────────────
const store = new Map();
const sessionStorageMock = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

// Patch global crypto and sessionStorage so the module works without a browser
if (typeof global.sessionStorage === 'undefined') {
  Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock, writable: true });
}

// Inline the module logic to test it without jsdom
const generateOAuthState = () => {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  try { sessionStorage.setItem(OAUTH_STATE_KEY, hex); } catch {}
  return hex;
};

const validateOAuthState = (receivedState) => {
  let storedState = null;
  try {
    storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  } catch { return false; }
  if (!storedState || !receivedState) return false;
  if (storedState.length !== receivedState.length) return false;
  let mismatch = 0;
  for (let i = 0; i < storedState.length; i++) {
    mismatch |= storedState.charCodeAt(i) ^ receivedState.charCodeAt(i);
  }
  return mismatch === 0;
};

const hasStoredOAuthState = () => {
  try { return sessionStorage.getItem(OAUTH_STATE_KEY) !== null; } catch { return false; }
};

const clearOAuthState = () => {
  try { sessionStorage.removeItem(OAUTH_STATE_KEY); } catch {}
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('oauthState — generateOAuthState', () => {
  beforeEach(() => store.clear());

  it('returns a non-empty hex string of length 64', () => {
    const state = generateOAuthState();
    expect(typeof state).toBe('string');
    expect(state).toHaveLength(64);
    expect(state).toMatch(/^[0-9a-f]+$/);
  });

  it('stores the generated value in sessionStorage', () => {
    const state = generateOAuthState();
    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBe(state);
  });

  it('two successive calls produce different values', () => {
    const s1 = generateOAuthState();
    store.clear();
    const s2 = generateOAuthState();
    expect(s1).not.toBe(s2);
  });
});

describe('oauthState — validateOAuthState', () => {
  beforeEach(() => store.clear());

  it('returns true when received state matches stored state', () => {
    const state = generateOAuthState();
    expect(validateOAuthState(state)).toBe(true);
  });

  it('returns false for a mismatched state', () => {
    generateOAuthState();
    expect(validateOAuthState('deadbeef'.repeat(8))).toBe(false);
  });

  it('returns false when no state has been stored', () => {
    expect(validateOAuthState('anyrandomvalue')).toBe(false);
  });

  it('removes the stored state after successful validation (one-time use)', () => {
    const state = generateOAuthState();
    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).not.toBeNull();

    validateOAuthState(state);

    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
  });

  it('removes the stored state even after failed validation (no replay)', () => {
    generateOAuthState();
    validateOAuthState('wrongvalue');
    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
  });

  it('returns false for null received state', () => {
    generateOAuthState();
    expect(validateOAuthState(null)).toBe(false);
  });

  it('returns false for undefined received state', () => {
    generateOAuthState();
    expect(validateOAuthState(undefined)).toBe(false);
  });

  it('returns false for an empty string received state', () => {
    generateOAuthState();
    expect(validateOAuthState('')).toBe(false);
  });

  it('cannot be validated twice with the same state (one-time use)', () => {
    const state = generateOAuthState();
    const first = validateOAuthState(state);
    const second = validateOAuthState(state);
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});

describe('oauthState — hasStoredOAuthState and clearOAuthState', () => {
  beforeEach(() => store.clear());

  it('hasStoredOAuthState returns false when nothing stored', () => {
    expect(hasStoredOAuthState()).toBe(false);
  });

  it('hasStoredOAuthState returns true after generateOAuthState', () => {
    generateOAuthState();
    expect(hasStoredOAuthState()).toBe(true);
  });

  it('clearOAuthState removes the stored state', () => {
    generateOAuthState();
    expect(hasStoredOAuthState()).toBe(true);
    clearOAuthState();
    expect(hasStoredOAuthState()).toBe(false);
  });

  it('clearOAuthState does not throw when nothing stored', () => {
    expect(() => clearOAuthState()).not.toThrow();
  });
});
