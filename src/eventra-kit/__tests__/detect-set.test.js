import { describe, it, expect } from 'vitest';
import { detectSet } from '../detect-set.js';

describe('detect-set', () => {
  it('detects Set instances', () => {
    expect(detectSet(new Set([1, 2]))).toBe(true);
    expect(detectSet(new Set())).toBe(true);
    expect(detectSet([1, 2])).toBe(false);
    expect(detectSet(null)).toBe(false);
  });
});
