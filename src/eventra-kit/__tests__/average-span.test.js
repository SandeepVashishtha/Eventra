import { describe, it, expect } from 'vitest';
import { averageSpan } from '../average-span.js';

describe('average-span', () => {
  it('computes the average of a list', () => {
    expect(averageSpan([1, 2, 3])).toBe(2);
    expect(averageSpan([10, 20])).toBe(15);
    expect(averageSpan([])).toBe(0);
  });
});
