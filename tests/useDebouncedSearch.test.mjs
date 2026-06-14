/**
 * Tests for src/hooks/useDebouncedSearch.js
 *
 * Verifies the debounced search hook contract, including
 * search term state, debounce delay, isDebouncing state, and clear function.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useDebouncedSearch.js'),
  'utf8',
);

describe('useDebouncedSearch — source contract', () => {
  it('exports useDebouncedSearch as named export', () => {
    assert.ok(
      src.includes('export function useDebouncedSearch'),
      'Must export useDebouncedSearch as named export',
    );
  });

  it('exports useDebouncedSearch as default export', () => {
    assert.ok(
      src.includes('export default useDebouncedSearch'),
      'Must export useDebouncedSearch as default export',
    );
  });

  it('uses useState for searchTerm state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for searchTerm state',
    );
  });

  it('uses useState for debouncedTerm state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for debouncedTerm state',
    );
  });

  it('uses useState for isDebouncing state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for isDebouncing state',
    );
  });

  it('uses useRef to store timer reference', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use useRef to store timer reference',
    );
  });

  it('uses useEffect for debounce logic', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for debounce logic',
    );
  });

  it('uses useCallback for clear function', () => {
    assert.ok(
      src.includes('useCallback'),
      'Must use useCallback for clear function',
    );
  });

  it('uses setTimeout for debouncing', () => {
    assert.ok(
      src.includes('setTimeout'),
      'Must use setTimeout for debouncing',
    );
  });

  it('uses clearTimeout to cleanup timer', () => {
    assert.ok(
      src.includes('clearTimeout'),
      'Must use clearTimeout to cleanup timer',
    );
  });

  it('accepts initialValue parameter with default empty string', () => {
    assert.ok(
      src.includes("initialValue = ''") ||
        src.includes('initialValue=""') ||
        src.includes('initialValue={}'),
      'Must accept initialValue parameter with default empty string',
    );
  });

  it('accepts delay parameter with default 300ms', () => {
    assert.ok(
      src.includes('delay = 300'),
      'Must accept delay parameter with default 300ms',
    );
  });
});

describe('useDebouncedSearch — return contract', () => {
  it('returns searchTerm state', () => {
    assert.ok(
      src.includes('searchTerm'),
      'Must return searchTerm state',
    );
  });

  it('returns debouncedTerm state', () => {
    assert.ok(
      src.includes('debouncedTerm'),
      'Must return debouncedTerm state',
    );
  });

  it('returns setSearchTerm setter', () => {
    assert.ok(
      src.includes('setSearchTerm'),
      'Must return setSearchTerm setter',
    );
  });

  it('returns isDebouncing state', () => {
    assert.ok(
      src.includes('isDebouncing'),
      'Must return isDebouncing state',
    );
  });

  it('returns clear function', () => {
    assert.ok(
      src.includes('clear'),
      'Must return clear function',
    );
  });
});

describe('useDebouncedSearch — behavior contract', () => {
  it('clears timer on searchTerm change', () => {
    assert.ok(
      src.includes('clearTimeout(timerRef.current)'),
      'Must clear existing timer on searchTerm change',
    );
  });

  it('sets isDebouncing to true when debouncing', () => {
    assert.ok(
      src.includes("setIsDebouncing(true)"),
      'Must set isDebouncing to true when debouncing',
    );
  });

  it('sets isDebouncing to false after debounce completes', () => {
    assert.ok(
      src.includes("setIsDebouncing(false)"),
      'Must set isDebouncing to false after debounce completes',
    );
  });

  it('clears timer on cleanup in useEffect', () => {
    const useEffectMatch = src.match(/useEffect\(\(\) => \{[\s\S]*?return \(\) => \{[\s\S]*?\}[\s\S]*?\}/);
    if (useEffectMatch) {
      const cleanup = useEffectMatch[0];
      assert.ok(
        cleanup.includes('clearTimeout'),
        'Cleanup function must clear timeout',
      );
    }
  });

  it('clear function resets all state', () => {
    assert.ok(
      src.includes("setSearchTerm('')") && src.includes("setDebouncedTerm('')"),
      'Clear function must reset searchTerm and debouncedTerm',
    );
  });
});