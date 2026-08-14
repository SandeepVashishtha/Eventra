import { describe, it, expect } from 'vitest';
import { calculateList } from '../calculate-list.js';

describe('calculate-list', () => {
  it('computes the sum of a list', () => {
    expect(calculateList([1, 2, 3])).toBe(6);
    expect(calculateList([10, -4])).toBe(6);
    expect(calculateList([])).toBe(0);
  });
});
