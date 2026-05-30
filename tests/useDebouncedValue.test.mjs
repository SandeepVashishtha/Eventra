/**
 * Tests for src/hooks/useDebouncedValue.js
 *
 * Verifies the debounced value hook contract, including
 * useDebouncedValue, useDebouncedCallback, and useDebouncedSearch functions.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useDebouncedValue.js'),
  'utf8',
);

describe('useDebouncedValue — source contract', () => {
  it('exports useDebouncedValue as named export', () => {
    assert.ok(
      src.includes('export function useDebouncedValue'),
      'Must export useDebouncedValue as named export',
    );
  });

  it('exports useDebouncedCallback as named export', () => {
    assert.ok(
      src.includes('export function useDebouncedCallback'),
      'Must export useDebouncedCallback as named export',
    );
  });

  it('exports useDebouncedSearch as named export', () => {
    assert.ok(
      src.includes('export function useDebouncedSearch'),
      'Must export useDebouncedSearch as named export',
    );
  });

  it('uses useState for debouncedValue state in useDebouncedValue', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for debouncedValue state',
    );
  });

  it('uses useEffect for timeout logic', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for timeout logic',
    );
  });

  it('uses useRef for timer reference in useDebouncedCallback', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use useRef for timer reference',
    );
  });

  it('uses useCallback for stable callback wrapper', () => {
    assert.ok(
      src.includes('useCallback'),
      'Must use useCallback for stable callback wrapper',
    );
  });

  it('uses setTimeout for debouncing', () => {
    assert.ok(
      src.includes('setTimeout'),
      'Must use setTimeout for debouncing',
    );
  });

  it('uses clearTimeout for cleanup', () => {
    assert.ok(
      src.includes('clearTimeout'),
      'Must use clearTimeout for cleanup',
    );
  });

  it('accepts value and delayMs parameters', () => {
    assert.ok(
      src.includes('value, delayMs = 300') ||
        src.includes('value, delayMs=300'),
      'Must accept value and delayMs parameters',
    );
  });
});

describe('useDebouncedValue — return contract', () => {
  it('useDebouncedValue returns debouncedValue', () => {
    assert.ok(
      src.includes('return debouncedValue'),
      'Must return debouncedValue',
    );
  });
});

describe('useDebouncedCallback — contract', () => {
  it('uses callbackRef to keep callback current', () => {
    assert.ok(
      src.includes('callbackRef'),
      'Must use callbackRef to keep callback current',
    );
  });

  it('updates callbackRef.current in useEffect', () => {
    assert.ok(
      src.includes('callbackRef.current = callback'),
      'Must update callbackRef.current in useEffect',
    );
  });

  it('clears existing timeout before setting new one', () => {
    assert.ok(
      src.includes('clearTimeout(timerRef.current)'),
      'Must clear existing timeout before setting new one',
    );
  });

  it('resets timerRef.current after callback fires', () => {
    assert.ok(
      src.includes('timerRef.current = null'),
      'Must reset timerRef.current after callback fires',
    );
  });
});

describe('useDebouncedSearch — contract', () => {
  it('uses useDebouncedValue internally', () => {
    assert.ok(
      src.includes('useDebouncedValue(inputValue, delayMs)'),
      'Must use useDebouncedValue internally',
    );
  });

  it('returns inputValue, searchTerm, and setInputValue', () => {
    assert.ok(
      src.includes('return { inputValue, searchTerm, setInputValue }'),
      'Must return inputValue, searchTerm, and setInputValue',
    );
  });

  it('accepts initialValue and delayMs parameters', () => {
    assert.ok(
      src.includes('initialValue = ""') &&
        src.includes('delayMs = 300'),
      'Must accept initialValue and delayMs parameters',
    );
  });
});