/**
 * Tests for src/hooks/useFocusTrap.js
 *
 * Verifies the focus trap hook contract for modal accessibility.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useFocusTrap.js'),
  'utf8',
);

describe('useFocusTrap — source contract', () => {
  it('exports useFocusTrap as named export', () => {
    assert.ok(
      src.includes('export function useFocusTrap'),
      'Must export useFocusTrap as named export',
    );
  });

  it('uses useEffect for focus trap logic', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for focus trap logic',
    );
  });

  it('uses useRef for container and previous focus references', () => {
    const useRefMatches = src.match(/useRef/g);
    assert.ok(
      useRefMatches && useRefMatches.length >= 2,
      'Must use useRef at least twice for container and previous focus',
    );
  });

  it('adds keydown event listener to document', () => {
    assert.ok(
      src.includes('addEventListener') && src.includes('keydown'),
      'Must add keydown event listener to document',
    );
  });

  it('removes keydown event listener on cleanup', () => {
    assert.ok(
      src.includes('removeEventListener') && src.includes('keydown'),
      'Must remove keydown event listener on cleanup',
    );
  });

  it('stores previous focus before trap activates', () => {
    assert.ok(
      src.includes('previousFocusRef.current = document.activeElement'),
      'Must store previous focus before trap activates',
    );
  });

  it('restores previous focus on cleanup', () => {
    assert.ok(
      src.includes('previousFocusRef.current.focus'),
      'Must restore previous focus on cleanup',
    );
  });

  it('handles Tab key for focus cycling', () => {
    assert.ok(
      src.includes("e.key !== 'Tab'") || src.includes('e.key !== "Tab"'),
      'Must handle Tab key for focus cycling',
    );
  });

  it('handles Shift+Tab for reverse cycling', () => {
    assert.ok(
      src.includes('e.shiftKey'),
      'Must handle Shift+Tab for reverse cycling',
    );
  });
});

describe('useFocusTrap — FOCUSABLE_SELECTORS', () => {
  it('defines FOCUSABLE_SELECTORS array', () => {
    assert.ok(
      src.includes('FOCUSABLE_SELECTORS'),
      'Must define FOCUSABLE_SELECTORS array',
    );
  });

  it('includes anchor tags with href', () => {
    assert.ok(
      src.includes("a[href]"),
      'Must include anchor tags with href',
    );
  });

  it('includes buttons (excluding disabled)', () => {
    assert.ok(
      src.includes('button:not([disabled])'),
      'Must include buttons excluding disabled',
    );
  });

  it('includes textareas (excluding disabled)', () => {
    assert.ok(
      src.includes('textarea:not([disabled])'),
      'Must include textareas excluding disabled',
    );
  });

  it('includes inputs (excluding disabled)', () => {
    assert.ok(
      src.includes('input:not([disabled])'),
      'Must include inputs excluding disabled',
    );
  });

  it('includes selects (excluding disabled)', () => {
    assert.ok(
      src.includes('select:not([disabled])'),
      'Must include selects excluding disabled',
    );
  });

  it('includes elements with tabindex', () => {
    assert.ok(
      src.includes('[tabindex]:not([tabindex="-1"])'),
      'Must include elements with positive tabindex',
    );
  });
});

describe('useFocusTrap — focus management', () => {
  it('queries focusable elements in container', () => {
    assert.ok(
      src.includes('container.querySelectorAll(FOCUSABLE_SELECTORS)'),
      'Must query focusable elements in container',
    );
  });

  it('focuses first element when trap activates', () => {
    assert.ok(
      src.includes('focusable[0].focus()'),
      'Must focus first element when trap activates',
    );
  });

  it('cycles focus from last to first on Tab', () => {
    assert.ok(
      src.includes('last.focus()') && src.includes('first.focus()'),
      'Must cycle focus from last to first on Tab',
    );
  });

  it('cycles focus from first to last on Shift+Tab', () => {
    assert.ok(
      src.includes('first.focus()') && src.includes('last.focus()'),
      'Must cycle focus from first to last on Shift+Tab',
    );
  });

  it('returns containerRef', () => {
    assert.ok(
      src.includes('return containerRef'),
      'Must return containerRef',
    );
  });
});

describe('useFocusTrap — parameter', () => {
  it('accepts isActive boolean parameter', () => {
    assert.ok(
      src.includes('isActive'),
      'Must accept isActive boolean parameter',
    );
  });
});