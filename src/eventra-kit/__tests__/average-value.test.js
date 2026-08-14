import { describe, it, expect } from 'vitest';
import { averageValue } from '../average-value.js';

describe('average-value', () => {
  it('computes the average of a list of values', () => {
    expect(averageValue([1, 2, 3])).toBe(2);
    expect(averageValue([10, 20])).toBe(15);
    expect(averageValue([])).toBe(0);
  });
});
