/**
 * Tests for src/hooks/useLenis.js
 *
 * Verifies the Lenis smooth scrolling hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useLenis.js'),
  'utf8',
);

describe('useLenis — source contract', () => {
  it('exports useLenis as default export', () => {
    assert.ok(
      src.includes('export default useLenis'),
      'Must export useLenis as default export',
    );
  });

  it('uses useEffect for Lenis initialization', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for Lenis initialization',
    );
  });

  it('imports Lenis from @studio-freight/lenis', () => {
    assert.ok(
      src.includes('@studio-freight/lenis'),
      'Must import Lenis from @studio-freight/lenis',
    );
  });

  it('checks for touch device using pointer: coarse media query', () => {
    assert.ok(
      src.includes('pointer: coarse'),
      'Must check for touch device using pointer: coarse media query',
    );
  });

  it('uses requestAnimationFrame for RAF loop', () => {
    assert.ok(
      src.includes('requestAnimationFrame'),
      'Must use requestAnimationFrame for RAF loop',
    );
  });

  it('cancels RAF on unmount', () => {
    assert.ok(
      src.includes('cancelAnimationFrame'),
      'Must cancel RAF on unmount',
    );
  });

  it('destroys Lenis instance on unmount', () => {
    assert.ok(
      src.includes('lenis.destroy()'),
      'Must destroy Lenis instance on unmount',
    );
  });

  it('exposes Lenis instance globally', () => {
    assert.ok(
      src.includes('window.lenis = lenis'),
      'Must expose Lenis instance globally',
    );
  });

  it('clears global Lenis reference on unmount', () => {
    assert.ok(
      src.includes('window.lenis = null'),
      'Must clear global Lenis reference on unmount',
    );
  });
});

describe('useLenis — configuration', () => {
  it('accepts options parameter', () => {
    assert.ok(
      src.includes('options = {}'),
      'Must accept options parameter with default empty object',
    );
  });

  it('sets duration option', () => {
    assert.ok(
      src.includes('duration: 1.2'),
      'Must set duration option',
    );
  });

  it('sets direction option', () => {
    assert.ok(
      src.includes('direction: "vertical"'),
      'Must set direction option',
    );
  });

  it('sets gestureDirection option', () => {
    assert.ok(
      src.includes('gestureDirection: "vertical"'),
      'Must set gestureDirection option',
    );
  });

  it('sets smooth option', () => {
    assert.ok(
      src.includes('smooth: true'),
      'Must set smooth option',
    );
  });

  it('sets smoothTouch option', () => {
    assert.ok(
      src.includes('smoothTouch: false'),
      'Must set smoothTouch option',
    );
  });

  it('sets touchMultiplier option', () => {
    assert.ok(
      src.includes('touchMultiplier: 2'),
      'Must set touchMultiplier option',
    );
  });

  it('sets infinite option', () => {
    assert.ok(
      src.includes('infinite: false'),
      'Must set infinite option',
    );
  });

  it('spreads options into Lenis config', () => {
    assert.ok(
      src.includes('...options'),
      'Must spread options into Lenis config',
    );
  });
});

describe('useLenis — RAF loop', () => {
  it('calls lenis.raf in RAF loop', () => {
    assert.ok(
      src.includes('lenis.raf(time)'),
      'Must call lenis.raf in RAF loop',
    );
  });

  it('stores RAF id for cleanup', () => {
    assert.ok(
      src.includes('rafId'),
      'Must store RAF id for cleanup',
    );
  });
});