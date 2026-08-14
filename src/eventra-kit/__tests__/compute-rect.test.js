import { describe, it, expect } from 'vitest';
import { computeRect } from '../compute-rect.js';

describe('compute-rect', () => {
  it('computes the area of a rectangle', () => {
    expect(computeRect(4, 5)).toBe(20);
    expect(computeRect(3, 7)).toBe(21);
    expect(computeRect(0, 5)).toBe(0);
  });
});
