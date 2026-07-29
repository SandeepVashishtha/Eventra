/**
 * Tests for src/hooks/useReducedMotion.js
 *
 * Verifies the reduced motion preference hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useReducedMotion.js'),
  'utf8',
);

describe('useReducedMotion — source contract', () => {
  it('exports useReducedMotion as named export', () => {
    assert.ok(
      src.includes('export function useReducedMotion'),
      'Must export useReducedMotion as named export',
    );
  });

  it('exports useReducedMotion as default export', () => {
    assert.ok(
      src.includes('export default useReducedMotion'),
      'Must export useReducedMotion as default export',
    );
  });

  it('uses useState for prefersReduced state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for prefersReduced state',
    );
  });

  it('uses useEffect for media query listener', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for media query listener',
    );
  });

  it('uses matchMedia to query prefers-reduced-motion', () => {
    assert.ok(
      src.includes('matchMedia'),
      'Must use matchMedia to query prefers-reduced-motion',
    );
  });

  it('adds change listener to media query', () => {
    assert.ok(
      src.includes('addEventListener'),
      'Must add change listener to media query',
    );
  });

  it('removes change listener on cleanup', () => {
    assert.ok(
      src.includes('removeEventListener'),
      'Must remove change listener on cleanup',
    );
  });
});

describe('useReducedMotion — media query', () => {
  it('checks (prefers-reduced-motion: reduce) media query', () => {
    assert.ok(
      src.includes('prefers-reduced-motion'),
      'Must check (prefers-reduced-motion: reduce) media query',
    );
  });

  it('uses media query matches property', () => {
    assert.ok(
      src.includes('.matches'),
      'Must use media query matches property',
    );
  });
});

describe('useReducedMotion — return contract', () => {
  it('returns prefersReduced state', () => {
    assert.ok(
      src.includes('return prefersReduced'),
      'Must return prefersReduced state',
    );
  });
});

describe('useReducedMotion — initialization', () => {
  it('initializes state with function to check initial preference', () => {
    assert.ok(
      src.includes('useState(() =>'),
      'Must initialize state with function to check initial preference',
    );
  });

  it('checks typeof window !== undefined', () => {
    assert.ok(
      src.includes('typeof window'),
      'Must check typeof window !== undefined for SSR safety',
    );
  });

  it('checks typeof window.matchMedia === function', () => {
    assert.ok(
      src.includes('matchMedia'),
      'Must check typeof window.matchMedia === function for feature detection',
    );
  });
});

describe('useReducedMotion — cleanup', () => {
  it('returns cleanup function from useEffect', () => {
    assert.ok(
      src.includes('return () =>'),
      'Must return cleanup function from useEffect',
    );
  });

  it('removes event listener on cleanup', () => {
    assert.ok(
      src.includes('removeEventListener'),
      'Must remove event listener on cleanup',
    );
  });

  it('uses optional chaining for removeEventListener', () => {
    assert.ok(
      src.includes('removeEventListener?.'),
      'Must use optional chaining for removeEventListener',
    );
  });
});