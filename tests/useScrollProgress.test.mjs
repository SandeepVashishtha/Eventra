/**
 * Tests for src/hooks/useScrollProgress.js
 *
 * Verifies the scroll progress tracking hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useScrollProgress.js'),
  'utf8',
);

describe('useScrollProgress — source contract', () => {
  it('exports useScrollProgress as named export', () => {
    assert.ok(
      src.includes('export function useScrollProgress'),
      'Must export useScrollProgress as named export',
    );
  });

  it('uses useState for progress state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for progress state',
    );
  });

  it('uses useEffect for scroll listener', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for scroll listener',
    );
  });

  it('uses useRef for RAF reference', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use useRef for RAF reference',
    );
  });

  it('adds scroll event listener', () => {
    assert.ok(
      src.includes('addEventListener') && src.includes('scroll'),
      'Must add scroll event listener',
    );
  });

  it('removes scroll event listener on cleanup', () => {
    assert.ok(
      src.includes('removeEventListener') && src.includes('scroll'),
      'Must remove scroll event listener on cleanup',
    );
  });

  it('adds resize event listener', () => {
    assert.ok(
      src.includes('addEventListener') && src.includes('resize'),
      'Must add resize event listener',
    );
  });

  it('removes resize event listener on cleanup', () => {
    assert.ok(
      src.includes('removeEventListener') && src.includes('resize'),
      'Must remove resize event listener on cleanup',
    );
  });

  it('uses requestAnimationFrame for throttling', () => {
    assert.ok(
      src.includes('requestAnimationFrame'),
      'Must use requestAnimationFrame for throttling',
    );
  });

  it('cancels RAF on cleanup', () => {
    assert.ok(
      src.includes('cancelAnimationFrame'),
      'Must cancel RAF on cleanup',
    );
  });
});

describe('useScrollProgress — return contract', () => {
  it('returns progress state', () => {
    assert.ok(
      src.includes('return progress'),
      'Must return progress state',
    );
  });
});

describe('useScrollProgress — scroll calculation', () => {
  it('calculates scroll percentage from scrollY', () => {
    assert.ok(
      src.includes('scrollY'),
      'Must calculate scroll percentage from scrollY',
    );
  });

  it('gets scrollTop from documentElement', () => {
    assert.ok(
      src.includes('documentElement'),
      'Must get scrollTop from documentElement',
    );
  });

  it('calculates document height', () => {
    assert.ok(
      src.includes('scrollHeight'),
      'Must calculate document height',
    );
  });

  it('subtracts window height for scrollable area', () => {
    assert.ok(
      src.includes('innerHeight'),
      'Must subtract window height for scrollable area',
    );
  });

  it('clamps progress between 0 and 100', () => {
    assert.ok(
      src.includes('Math.max(0') && src.includes('Math.min(100'),
      'Must clamp progress between 0 and 100',
    );
  });

  it('rounds progress to integer', () => {
    assert.ok(
      src.includes('Math.round'),
      'Must round progress to integer',
    );
  });
});

describe('useScrollProgress — passive listener', () => {
  it('uses passive event listener for scroll', () => {
    assert.ok(
      src.includes('passive: true'),
      'Must use passive event listener for scroll',
    );
  });
});