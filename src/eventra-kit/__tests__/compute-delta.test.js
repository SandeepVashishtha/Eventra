import { describe, it, expect } from 'vitest';
import { computeDelta } from '../compute-delta.js';

describe('compute-delta', () => {
  it('computes the absolute difference between two numbers', () => {
    expect(computeDelta(5, 8)).toBe(3);
    expect(computeDelta(8, 5)).toBe(3);
    expect(computeDelta(3, 3)).toBe(0);
  });
});
