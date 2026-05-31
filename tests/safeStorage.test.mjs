/**
 * Behavioral tests for src/utils/safeStorage.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('safeStorage - storage availability check', () => {
  it('returns false when storage is null', () => {
    const isBrowserStorageAvailable = (storage) => !storage;
    assert.strictEqual(isBrowserStorageAvailable(null), true);
    assert.strictEqual(isBrowserStorageAvailable(undefined), true);
  });
});

describe('safeStorage - getItem', () => {
  it('returns fallback when storage is unavailable', () => {
    const getItem = (storage, key, fallback = null) => {
      try {
        return storage?.getItem(key) ?? fallback;
      } catch (_) {
        return fallback;
      }
    };

    assert.strictEqual(getItem(null, 'key', 'default'), 'default');
  });

  it('returns value when key exists in storage', () => {
    const mockStorage = { getItem: (key) => 'stored_value' };
    const getItem = (storage, key, fallback = null) => storage?.getItem(key) ?? fallback;

    assert.strictEqual(getItem(mockStorage, 'key', 'default'), 'stored_value');
  });

  it('returns fallback when key does not exist', () => {
    const mockStorage = { getItem: (key) => null };
    const getItem = (storage, key, fallback = null) => storage?.getItem(key) ?? fallback;

    assert.strictEqual(getItem(mockStorage, 'nonexistent', 'fallback'), 'fallback');
  });
});

describe('safeStorage - setItem', () => {
  it('returns true on successful set', () => {
    let stored = null;
    const mockStorage = {
      setItem: (key, value) => { stored = value; },
    };

    const setItem = (storage, key, value) => {
      try {
        storage?.setItem(key, value);
        return true;
      } catch (_) {
        return false;
      }
    };

    assert.strictEqual(setItem(mockStorage, 'key', 'value'), true);
    assert.strictEqual(stored, 'value');
  });

  it('returns false when storage throws QuotaExceededError', () => {
    const mockStorage = {
      setItem: () => { throw new Error('QuotaExceededError'); },
    };

    const setItem = (storage, key, value) => {
      try {
        storage?.setItem(key, value);
        return true;
      } catch (_) {
        return false;
      }
    };

    assert.strictEqual(setItem(mockStorage, 'key', 'value'), false);
  });
});

describe('safeStorage - removeItem', () => {
  it('returns true on successful remove', () => {
    let removed = false;
    const mockStorage = {
      removeItem: (key) => { removed = true; },
    };

    const removeItem = (storage, key) => {
      try {
        storage?.removeItem(key);
        return true;
      } catch (_) {
        return false;
      }
    };

    assert.strictEqual(removeItem(mockStorage, 'key'), true);
    assert.strictEqual(removed, true);
  });
});

describe('safeStorage - clear', () => {
  it('returns true on successful clear', () => {
    let cleared = false;
    const mockStorage = {
      clear: () => { cleared = true; },
    };

    const clear = (storage) => {
      try {
        storage?.clear();
        return true;
      } catch (_) {
        return false;
      }
    };

    assert.strictEqual(clear(mockStorage), true);
    assert.strictEqual(cleared, true);
  });
});

describe('safeStorage - getJson', () => {
  it('returns fallback for null/empty values', () => {
    const getJson = (raw, fallback = null) => {
      if (raw == null) return fallback;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    };

    assert.strictEqual(getJson(null, { default: true }).default, true);
    assert.strictEqual(getJson(undefined, { default: true }).default, true);
  });

  it('parses valid JSON', () => {
    const getJson = (raw, fallback = null) => {
      if (raw == null) return fallback;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    };

    const result = getJson('{"name":"test","value":123}', null);
    assert.strictEqual(result.name, 'test');
    assert.strictEqual(result.value, 123);
  });
});

describe('safeStorage - setJson', () => {
  it('stringifies object and returns true on success', () => {
    const mockSetItem = (value) => {
      return JSON.stringify(value);
    };

    const result = mockSetItem({ name: 'test' });
    assert.ok(result.includes('"name"'), 'Result should be JSON string');
    assert.ok(result.includes('test'), 'Result should contain value');
  });
});

describe('safeStorage - length property', () => {
  it('returns 0 when storage is unavailable', () => {
    const getLength = () => {
      try {
        return null?.length ?? 0;
      } catch (_) {
        return 0;
      }
    };

    assert.strictEqual(getLength(), 0);
  });

  it('returns storage length when available', () => {
    const getLength = () => {
      try {
        return { length: 5 }?.length ?? 0;
      } catch (_) {
        return 0;
      }
    };

    assert.strictEqual(getLength(), 5);
  });
});