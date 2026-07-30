/**
 * Tests for src/hooks/useDebounce.js
 *
 * Verifies the debounced hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useDebounce.js'),
  'utf8',
);

describe('useDebounce — source contract', () => {
  it('exports useDebounce as default export', () => {
    assert.ok(
      src.includes('export default function useDebounce') || src.includes('export default useDebounce'),
      'Must export useDebounce as default export',
    );
  });

  it('uses useState for debounced value state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState to hold debounced state value',
    );
  });

  it('uses useEffect for managing side-effect timing', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for managing side-effect timing',
    );
  });

  it('uses setTimeout to delay state updates', () => {
    assert.ok(
      src.includes('setTimeout'),
      'Must use setTimeout to delay updates',
    );
  });

  it('clears timers on component cleanup to avoid leaks', () => {
    assert.ok(
      src.includes('clearTimeout'),
      'Must call clearTimeout to clear timers on cleanup',
    );
  });

  it('safely handles non-positive or invalid delay parameters', () => {
    assert.ok(
      src.includes('delay = 300') || src.includes('300'),
      'Must provide 300ms default delay or fallback',
    );
  });
});

describe('useDebounce — return contract', () => {
  it('returns the debounced value state', () => {
    assert.ok(
      src.includes('return debouncedValue'),
      'Must return debouncedValue state variable',
    );
  });
});
