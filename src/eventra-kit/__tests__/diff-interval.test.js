import { describe, it, expect } from 'vitest';
import { diffInterval } from '../diff-interval.js';

describe('diff-interval', () => {
  it('computes the difference between two bounds', () => {
    expect(diffInterval(9, 2)).toBe(7);
    expect(diffInterval(2, 9)).toBe(7);
    expect(diffInterval(5, 5)).toBe(0);
  });
});
