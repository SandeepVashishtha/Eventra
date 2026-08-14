import { describe, it, expect } from 'vitest';
import { clampSize } from '../clamp-size.js';

describe('clamp-size', () => {
  it('clamps the size between lower and upper bounds', () => {
    expect(clampSize(5, 1, 3)).toBe(3);
    expect(clampSize(-2, 1, 10)).toBe(1);
    expect(clampSize(7, 1, 10)).toBe(7);
  });
});
