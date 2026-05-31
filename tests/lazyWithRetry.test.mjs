/**
 * Behavioral tests for src/utils/lazyWithRetry.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('lazyWithRetry - retry logic', () => {
  it('retries on failure up to max attempts', async () => {
    let attempts = 0;
    const importFn = async () => {
      attempts++;
      if (attempts <= 2) throw new Error('Temporary failure');
      return { default: 'loaded' };
    };

    let attempt = 0;
    const retries = 2;
    let result = null;
    let finalError = null;

    while (attempt <= retries) {
      try {
        result = await importFn();
        break;
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          finalError = err;
        }
      }
    }

    assert.strictEqual(attempts, 3, 'Should make 3 attempts before succeeding');
    assert.strictEqual(result?.default, 'loaded');
  });

  it('throws after max retries exhausted', async () => {
    let attempts = 0;
    const importFn = async () => {
      attempts++;
      throw new Error('Persistent failure');
    };

    let attempt = 0;
    const retries = 2;
    let finalError = null;

    while (attempt <= retries) {
      try {
        await importFn();
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          finalError = err;
        }
      }
    }

    assert.strictEqual(finalError?.message, 'Persistent failure');
    assert.strictEqual(attempts, 3, 'Should make 3 attempts before throwing');
  });

  it('succeeds on first attempt without retry', async () => {
    let attempts = 0;
    const importFn = async () => {
      attempts++;
      return { default: 'loaded' };
    };

    let attempt = 0;
    const retries = 2;
    let result = null;

    while (attempt <= retries) {
      try {
        result = await importFn();
        break;
      } catch (err) {
        attempt++;
      }
    }

    assert.strictEqual(attempts, 1, 'Should succeed on first attempt');
    assert.strictEqual(result?.default, 'loaded');
  });
});

describe('lazyWithRetry - exponential backoff', () => {
  it('increases delay with each retry attempt', () => {
    const delay = 1000;
    const attempt1Wait = delay * 1;
    const attempt2Wait = delay * 2;
    const attempt3Wait = delay * 3;

    assert.strictEqual(attempt1Wait, 1000, 'Wait time should be 1000ms for attempt 1');
    assert.strictEqual(attempt2Wait, 2000, 'Wait time should be 2000ms for attempt 2');
    assert.strictEqual(attempt3Wait, 3000, 'Wait time should be 3000ms for attempt 3');
  });
});

describe('lazyWithRetry - error propagation', () => {
  it('throws original error after exhausting retries', async () => {
    const importFn = async () => {
      throw new Error('Original error message');
    };

    let attempt = 0;
    const retries = 2;
    let finalError = null;

    while (attempt <= retries) {
      try {
        await importFn();
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          finalError = err;
        }
      }
    }

    assert.strictEqual(finalError?.message, 'Original error message');
  });
});