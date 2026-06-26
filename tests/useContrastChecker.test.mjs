/**
 * Tests for src/hooks/useContrastChecker.js
 *
 * Verifies the hook logic and contract for accessibility contrast checking.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useContrastChecker.js'),
  'utf8',
);

describe('useContrastChecker — source contract', () => {
  it('exports useContrastChecker as default export or named export', () => {
    assert.ok(
      src.includes('export function useContrastChecker') || src.includes('export default useContrastChecker'),
      'Must export useContrastChecker',
    );
  });

  it('uses useMemo to optimize calculation', () => {
    assert.ok(
      src.includes('useMemo'),
      'Must use useMemo to avoid recalculating on every render',
    );
  });

  it('checks for the 4.5:1 accessibility threshold', () => {
    assert.ok(
      src.includes('4.5'),
      'Must enforce the 4.5 contrast ratio threshold for WCAG AA compliance',
    );
  });
  
  it('calculates luminance according to WCAG guidelines', () => {
    assert.ok(
      src.includes('0.2126') && src.includes('0.7152') && src.includes('0.0722'),
      'Must calculate relative luminance properly',
    );
  });
});
