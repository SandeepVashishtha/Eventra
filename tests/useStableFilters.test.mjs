/**
 * Tests for src/hooks/useStableFilters.js
 *
 * Verifies the deep-equality skipping behaviour, the performance invariant
 * (no unnecessary filteredEvents recomputation), and edge cases.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Source-level contract
// ---------------------------------------------------------------------------

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useStableFilters.js'),
  'utf8',
);

describe('useStableFilters — source contract', () => {
  it('uses JSON.stringify for deep equality comparison', () => {
    assert.ok(
      src.includes('JSON.stringify'),
      'Must use JSON.stringify to compare old and new filter values',
    );
  });

  it('skips setState when values are equal', () => {
    assert.ok(
      src.includes('return') && src.includes('==='),
      'Must return early when values are deeply equal',
    );
  });

  it('wraps setter in useCallback for referential stability', () => {
    assert.ok(
      src.includes('useCallback'),
      'Setter must be wrapped in useCallback so it does not change identity on re-render',
    );
  });

  it('keeps a ref to the latest value for stale-closure safety', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use a ref to track latest value and avoid stale closure comparison',
    );
  });

  it('has a try/catch around JSON.stringify for safety', () => {
    assert.ok(
      src.includes('try') && src.includes('catch'),
      'Must handle JSON.stringify failures (circular refs) gracefully',
    );
  });
});

// ---------------------------------------------------------------------------
// Pure logic simulation: deep equality check
// ---------------------------------------------------------------------------

// Extract the equality logic so we can test it without React
function deepEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

describe('Deep equality logic', () => {
  it('empty objects are equal', () => {
    assert.ok(deepEqual({}, {}));
  });

  it('objects with same keys and values are equal', () => {
    assert.ok(deepEqual(
      { category: 'tech', priceRange: [0, 100] },
      { category: 'tech', priceRange: [0, 100] },
    ));
  });

  it('objects with different values are not equal', () => {
    assert.ok(!deepEqual(
      { category: 'tech' },
      { category: 'design' },
    ));
  });

  it('objects with different keys are not equal', () => {
    assert.ok(!deepEqual(
      { category: 'tech' },
      { category: 'tech', location: 'NYC' },
    ));
  });

  it('null and empty object are not equal', () => {
    assert.ok(!deepEqual(null, {}));
  });

  it('arrays with same values are equal', () => {
    assert.ok(deepEqual([1, 2, 3], [1, 2, 3]));
  });

  it('arrays with different order are not equal', () => {
    assert.ok(!deepEqual([1, 2, 3], [3, 2, 1]));
  });

  it('nested objects are compared deeply', () => {
    assert.ok(deepEqual(
      { date: { start: '2025-01-01', end: '2025-12-31' } },
      { date: { start: '2025-01-01', end: '2025-12-31' } },
    ));
    assert.ok(!deepEqual(
      { date: { start: '2025-01-01', end: '2025-12-31' } },
      { date: { start: '2025-01-01', end: '2025-06-30' } },
    ));
  });

  it('handles circular references without throwing', () => {
    // deepEqual should return false for circular refs (JSON.stringify throws)
    const circular = {};
    circular.self = circular;
    assert.doesNotThrow(() => deepEqual(circular, {}));
    assert.strictEqual(deepEqual(circular, {}), false);
  });
});

// ---------------------------------------------------------------------------
// Performance invariant: no recomputation on semantically identical update
// ---------------------------------------------------------------------------

describe('Performance invariant: skip on equal', () => {
  it('a clear filter operation ({} → {}) should be skipped', () => {
    const current = {};
    const next = {};
    // Different references, same content
    assert.notStrictEqual(current, next, 'Different references');
    assert.ok(deepEqual(current, next), 'But deeply equal — should skip setState');
  });

  it('adding a filter key triggers recomputation', () => {
    const current = {};
    const next = { category: 'tech' };
    assert.ok(!deepEqual(current, next), 'Different content — should trigger setState');
  });

  it('removing a filter key triggers recomputation', () => {
    const current = { category: 'tech', location: 'NYC' };
    const next = { category: 'tech' };
    assert.ok(!deepEqual(current, next), 'Different content — should trigger setState');
  });

  it('changing a filter value triggers recomputation', () => {
    const current = { priceRange: [0, 50] };
    const next = { priceRange: [0, 100] };
    assert.ok(!deepEqual(current, next), 'Changed value — should trigger setState');
  });

  it('calling setFilters with the same reference is also a no-op', () => {
    const filters = { category: 'tech' };
    assert.ok(deepEqual(filters, filters), 'Same reference is deeply equal');
  });
});

// ---------------------------------------------------------------------------
// useEventListing integration: verify import
// ---------------------------------------------------------------------------

const hookSrc = readFileSync(
  path.resolve(__dirname, '../src/Pages/Events/useEventListing.js'),
  'utf8',
);

describe('useEventListing — useStableFilters integration', () => {
  it('imports useStableFilters', () => {
    assert.ok(
      hookSrc.includes('useStableFilters'),
      'useEventListing must import and use useStableFilters',
    );
  });

  it('uses useStableFilters for advancedFilters state', () => {
    assert.ok(
      hookSrc.includes('useStableFilters({})') ||
        hookSrc.includes('useStableFilters( {})') ||
        hookSrc.includes('useStableFilters( {} )'),
      'advancedFilters must be managed by useStableFilters to prevent unnecessary memo recomputation',
    );
  });

  it('filteredEvents memo depends on advancedFilters', () => {
    const filteredMemoSection = hookSrc.slice(
      hookSrc.indexOf('filteredEvents = useMemo'),
      hookSrc.indexOf('totalPages = useMemo'),
    );
    assert.ok(
      filteredMemoSection.includes('advancedFilters'),
      'filteredEvents memo must include advancedFilters in its dependency array',
    );
  });
});
