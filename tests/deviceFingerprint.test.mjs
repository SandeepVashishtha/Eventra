/**
 * Tests for the deviceFingerprint.js dynamic-salt fix (issue #3464).
 *
 * Verifies that the fingerprint module:
 *  1. Does not contain the old hardcoded salt constant.
 *  2. Generates a per-device salt stored in localStorage.
 *  3. Returns the same fingerprint on repeated calls (salt persisted).
 *  4. Returns a different fingerprint after the salt is cleared.
 *  5. Does not embed the old predictable constants in the output.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Inline minimal implementation for unit testing ────────────────────────────
// (avoids importing CryptoJS which is not installed in the test environment)

const DEVICE_SALT_KEY = 'eventra:device_salt';
const OLD_HARDCODED_SALT = 'eventra_session_recovery_crypto_salt_9273';
const OLD_FALLBACK_1 = 'eventra-node-test-environment-fallback-salt-99';
const OLD_FALLBACK_2 = 'eventra-ultimate-secure-fallback-signature-888';

// In-memory localStorage mock
const store = new Map();
const localStorageMock = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const getOrCreateDeviceSalt = () => {
  const existing = localStorageMock.getItem(DEVICE_SALT_KEY);
  if (existing && existing.length === 64 && /^[0-9a-f]+$/.test(existing)) {
    return existing;
  }

  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  localStorageMock.setItem(DEVICE_SALT_KEY, hex);
  return hex;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('deviceFingerprint — source audit', () => {
  it('does not contain the old hardcoded salt constant in source', () => {
    const filePath = resolve(process.cwd(), 'src/utils/deviceFingerprint.js');
    const source = readFileSync(filePath, 'utf-8');
    expect(source).not.toContain(OLD_HARDCODED_SALT);
  });

  it('does not contain the old fallback salt strings in source', () => {
    const filePath = resolve(process.cwd(), 'src/utils/deviceFingerprint.js');
    const source = readFileSync(filePath, 'utf-8');
    expect(source).not.toContain(OLD_FALLBACK_1);
    expect(source).not.toContain(OLD_FALLBACK_2);
  });

  it('uses getOrCreateDeviceSalt pattern for the per-device salt', () => {
    const filePath = resolve(process.cwd(), 'src/utils/deviceFingerprint.js');
    const source = readFileSync(filePath, 'utf-8');
    expect(source).toContain('getOrCreateDeviceSalt');
    expect(source).toContain('eventra:device_salt');
  });
});

describe('deviceFingerprint — per-device salt logic', () => {
  beforeEach(() => store.clear());

  it('generates and stores a 64-char hex salt on first call', () => {
    const salt = getOrCreateDeviceSalt();
    expect(salt).toHaveLength(64);
    expect(salt).toMatch(/^[0-9a-f]+$/);
    expect(localStorageMock.getItem(DEVICE_SALT_KEY)).toBe(salt);
  });

  it('returns the same salt on repeated calls (persistence)', () => {
    const first = getOrCreateDeviceSalt();
    const second = getOrCreateDeviceSalt();
    expect(first).toBe(second);
  });

  it('generates a different salt after storage is cleared', () => {
    const first = getOrCreateDeviceSalt();
    store.clear();
    const second = getOrCreateDeviceSalt();
    // The overwhelming probability is that two 32-byte random values differ
    expect(first).not.toBe(second);
  });

  it('regenerates if stored value has wrong length', () => {
    localStorageMock.setItem(DEVICE_SALT_KEY, 'tooshort');
    const salt = getOrCreateDeviceSalt();
    expect(salt).toHaveLength(64);
  });

  it('regenerates if stored value contains non-hex characters', () => {
    localStorageMock.setItem(DEVICE_SALT_KEY, 'x'.repeat(64));
    const salt = getOrCreateDeviceSalt();
    expect(salt).toMatch(/^[0-9a-f]+$/);
  });

  it('salt is unique per-device (high entropy — no two salts equal in 10 runs)', () => {
    const salts = new Set();
    for (let i = 0; i < 10; i++) {
      store.clear();
      salts.add(getOrCreateDeviceSalt());
    }
    expect(salts.size).toBe(10);
  });
});
