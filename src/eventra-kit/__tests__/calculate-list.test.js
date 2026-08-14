import { describe, it, expect } from 'vitest';
import { calculateList } from '../calculate-list.js';

describe('calculate-list', () => {
  it('returns the size of a list', () => {
    expect(calculateList([10, 20, 30])).toBe(3);
    expect(calculateList([])).toBe(0);
    expect(calculateList(null)).toBe(0);
  });
});
