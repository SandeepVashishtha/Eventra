import { describe, it, expect } from 'vitest';
import { clampIndex } from '../clamp-index.js';

describe('clamp-index', () => {
  it('clamps the index between zero and the upper bound', () => {
    expect(clampIndex(5, 3)).toBe(3);
    expect(clampIndex(-2, 10)).toBe(0);
    expect(clampIndex(7, 10)).toBe(7);
  });
});
