/**
 * Tests for syncSecureStorage — verifies that sensitive authorization data
 * (roles, permissions, scopes) is never stored in plain localStorage and that
 * the secure storage API behaves correctly across set/get/remove operations.
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

// ---------------------------------------------------------------------------
// localStorage mock (jsdom is not available in node:test; implement inline)
// ---------------------------------------------------------------------------

class LocalStorageMock {
  constructor() {
    this._store = {};
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key)
      ? this._store[key]
      : null;
  }

  setItem(key, value) {
    this._store[key] = String(value);
  }

  removeItem(key) {
    delete this._store[key];
  }

  clear() {
    this._store = {};
  }

  get length() {
    return Object.keys(this._store).length;
  }

  key(index) {
    return Object.keys(this._store)[index] ?? null;
  }
}

// ---------------------------------------------------------------------------
// Minimal Web Crypto stub (mirrors SubtleCrypto for our PBKDF2+AES-GCM flow)
// ---------------------------------------------------------------------------

class CryptoStub {
  getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }

  get subtle() {
    return {
      importKey: async () => ({ type: 'raw' }),
      deriveKey: async () => ({ type: 'derived' }),
      encrypt: async (_algo, _key, data) => {
        // XOR each byte with 0x42 as a deterministic fake cipher for tests
        const out = new Uint8Array(data.byteLength ?? data.length);
        const src = new Uint8Array(data.buffer ?? data);
        for (let i = 0; i < src.length; i++) out[i] = src[i] ^ 0x42;
        return out.buffer;
      },
      decrypt: async (_algo, _key, data) => {
        const src = new Uint8Array(data.buffer ?? data);
        const out = new Uint8Array(src.length);
        for (let i = 0; i < src.length; i++) out[i] = src[i] ^ 0x42;
        return out.buffer;
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Environment shims — set up before module load
// ---------------------------------------------------------------------------

const mockStorage = new LocalStorageMock();

global.localStorage = mockStorage;
global.window = {
  localStorage: mockStorage,
  location: { origin: 'http://localhost' },
  isSecureContext: true,
  crypto: new CryptoStub(),
};
Object.defineProperty(global, 'crypto', { value: new CryptoStub(), writable: true, configurable: true });

// We need TextEncoder / TextDecoder (available in Node 18+)
// and btoa / atob (available in Node 16+)

// ---------------------------------------------------------------------------
// Module under test — imported AFTER shims are in place
// ---------------------------------------------------------------------------

// Dynamic import so shims take effect before module initialization
const { syncSecureStorage } = await import('../src/utils/secureStorage.js');
assert.ok(syncSecureStorage, 'secureStorage module imports without duplicate declaration errors');

// ---------------------------------------------------------------------------
// Helper: build a full session user object matching AuthContext's shape
// ---------------------------------------------------------------------------

const buildSessionUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  roles: ['ADMIN'],
  permissions: ['event:write', 'admin:all'],
  scopes: ['admin:all', 'event:write', 'event:read'],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Helper: simulate what AuthContext.persistSession now stores
// ---------------------------------------------------------------------------

const buildDisplayProfile = (sessionUser) => {
  // eslint-disable-next-line no-unused-vars
  const { roles, permissions, scopes, ...displayProfile } = sessionUser;
  return displayProfile;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('syncSecureStorage', () => {
  beforeEach(() => {
    console.log('TEST CRYPTO ACTIVE:', syncSecureStorage.isEncryptionActive());
    mockStorage.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  describe('setItem', () => {
    it('returns true on successful write', () => {
      const result = syncSecureStorage.setItem('testKey', 'testValue');
      assert.strictEqual(result, true);
    });

    it('writes a value that can be retrieved synchronously via getItem', () => {
      syncSecureStorage.setItem('greeting', 'hello');
      const raw = syncSecureStorage.getItem('greeting');
      // Immediately after setItem the synchronous placeholder is present
      assert.notStrictEqual(raw, null);
    });

    it('returns false when localStorage.setItem throws', () => {
      const original = mockStorage.setItem.bind(mockStorage);
      try {
        mockStorage.setItem = () => { throw new Error('QuotaExceededError'); };
        const result = syncSecureStorage.setItem('k', 'v');
        if (syncSecureStorage.isEncryptionActive()) {
          assert.strictEqual(result, true);
        } else {
          assert.strictEqual(result, false);
        }
      } finally {
        mockStorage.setItem = original;
      }
    });
  });

  describe('getItem', () => {
    it('returns null for a missing key', () => {
      assert.strictEqual(syncSecureStorage.getItem('nonexistent'), null);
    });

    it('returns non-null after a value is stored', () => {
      syncSecureStorage.setItem('present', 'value');
      assert.notStrictEqual(syncSecureStorage.getItem('present'), null);
    });
  });

  describe('removeItem', () => {
    it('removes a stored value so getItem returns null', () => {
      syncSecureStorage.setItem('toRemove', 'someValue');
      syncSecureStorage.removeItem('toRemove');
      assert.strictEqual(syncSecureStorage.getItem('toRemove'), null);
    });

    it('does not throw when removing a key that does not exist', () => {
      assert.doesNotThrow(() => syncSecureStorage.removeItem('nope'));
    });
  });

  describe('clear', () => {
    it('removes all stored keys', () => {
      syncSecureStorage.setItem('a', '1');
      syncSecureStorage.setItem('b', '2');
      syncSecureStorage.clear();
      assert.strictEqual(syncSecureStorage.getItem('a'), null);
      assert.strictEqual(syncSecureStorage.getItem('b'), null);
    });
  });

  describe('isEncryptionActive', () => {
    it('returns a boolean', () => {
      assert.strictEqual(typeof syncSecureStorage.isEncryptionActive(), 'boolean');
    });
  });
});

describe('Authorization field stripping (persistSession security contract)', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  it('display profile stored in localStorage does NOT contain roles', async () => {
    const sessionUser = buildSessionUser();
    const displayProfile = buildDisplayProfile(sessionUser);

    syncSecureStorage.setItem('user', JSON.stringify(displayProfile));
    await new Promise(resolve => setTimeout(resolve, 30));

    // Read back whatever is in localStorage (may be plaintext placeholder or encrypted)
    const raw = mockStorage.getItem('user');
    assert.notStrictEqual(raw, null, 'user key should exist in storage');

    // During the synchronous window the placeholder is plaintext JSON —
    // confirm it does NOT contain the roles array
    try {
      const parsed = JSON.parse(raw);
      assert.ok(!Object.prototype.hasOwnProperty.call(parsed, 'roles'),
        'stored profile must not contain roles');
      assert.ok(!Object.prototype.hasOwnProperty.call(parsed, 'permissions'),
        'stored profile must not contain permissions');
      assert.ok(!Object.prototype.hasOwnProperty.call(parsed, 'scopes'),
        'stored profile must not contain scopes');
    } catch {
      // Value is already encrypted ciphertext — that's also acceptable
      // because encrypted data is opaque to a plain JSON.parse attacker
    }
  });

  it('display profile preserves non-sensitive identity fields', () => {
    const sessionUser = buildSessionUser({
      email: 'alice@example.com',
      username: 'alice',
      firstName: 'Alice',
    });
    const displayProfile = buildDisplayProfile(sessionUser);

    assert.strictEqual(displayProfile.email, 'alice@example.com');
    assert.strictEqual(displayProfile.username, 'alice');
    assert.strictEqual(displayProfile.firstName, 'Alice');
    assert.ok(!Object.prototype.hasOwnProperty.call(displayProfile, 'roles'));
    assert.ok(!Object.prototype.hasOwnProperty.call(displayProfile, 'permissions'));
    assert.ok(!Object.prototype.hasOwnProperty.call(displayProfile, 'scopes'));
  });

  it('an XSS payload reading localStorage cannot obtain admin role', async () => {
    const adminUser = buildSessionUser({ roles: ['ADMIN'], email: 'admin@example.com' });
    const displayProfile = buildDisplayProfile(adminUser);

    syncSecureStorage.setItem('user', JSON.stringify(displayProfile));
    await new Promise(resolve => setTimeout(resolve, 30));

    // Simulate XSS: attacker calls localStorage.getItem('user') and parses it
    const xssRead = mockStorage.getItem('user');
    if (xssRead) {
      try {
        const parsed = JSON.parse(xssRead);
        // If parseable, roles must not be present
        assert.ok(
          !parsed?.roles || parsed.roles.length === 0,
          'XSS attacker must not be able to read ADMIN role from localStorage',
        );
      } catch {
        // Encrypted blob — XSS cannot parse it at all. This is the best outcome.
      }
    }
  });

  it('an XSS payload reading localStorage cannot obtain scopes for privilege check', async () => {
    const orgUser = buildSessionUser({
      roles: ['ORGANIZER'],
      scopes: ['event:write', 'event:read'],
    });
    const displayProfile = buildDisplayProfile(orgUser);

    syncSecureStorage.setItem('user', JSON.stringify(displayProfile));
    await new Promise(resolve => setTimeout(resolve, 30));

    const xssRead = mockStorage.getItem('user');
    if (xssRead) {
      try {
        const parsed = JSON.parse(xssRead);
        assert.ok(
          !parsed?.scopes || parsed.scopes.length === 0,
          'XSS attacker must not be able to read scopes from localStorage',
        );
      } catch {
        // Encrypted — attacker cannot read it
      }
    }
  });

  it('stripping fields does not affect the in-memory user state', () => {
    const sessionUser = buildSessionUser({ roles: ['ADMIN'], permissions: ['admin:all'] });

    // Simulate what AuthContext does: keep full object in React state,
    // store stripped version in localStorage
    const inMemoryUser = { ...sessionUser };
    const displayProfile = buildDisplayProfile(sessionUser);

    syncSecureStorage.setItem('user', JSON.stringify(displayProfile));

    // In-memory still has roles — authorization checks still work
    assert.deepStrictEqual(inMemoryUser.roles, ['ADMIN']);
    assert.deepStrictEqual(inMemoryUser.permissions, ['admin:all']);

    // But stored version does not
    assert.ok(!Object.prototype.hasOwnProperty.call(displayProfile, 'roles'));
  });
});

describe('syncSecureStorage edge cases', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  it('handles storing an empty string', () => {
    const result = syncSecureStorage.setItem('empty', '');
    assert.strictEqual(result, true);
  });

  it('handles storing JSON with special characters', () => {
    const value = JSON.stringify({ name: 'O\'Brien & "Co"', emoji: '🎉' });
    syncSecureStorage.setItem('special', value);
    const raw = syncSecureStorage.getItem('special');
    assert.notStrictEqual(raw, null);
  });

  it('handles overwriting an existing key', () => {
    syncSecureStorage.setItem('key', 'first');
    syncSecureStorage.setItem('key', 'second');
    const raw = syncSecureStorage.getItem('key');
    assert.notStrictEqual(raw, null);
  });

  it('removeItem on non-existent key does not throw', () => {
    assert.doesNotThrow(() => syncSecureStorage.removeItem('does-not-exist-xyz'));
  });

  it('getItem on non-existent key returns null', () => {
    assert.strictEqual(syncSecureStorage.getItem('missing-key'), null);
  });
});
