import { describe, it, expect } from 'vitest';
import { computeFraction } from '../compute-fraction.js';

describe('compute-fraction', () => {
  it('returns the fractional part of a number', () => {
    expect(computeFraction(3.75)).toBeCloseTo(0.75);
    expect(computeFraction(7)).toBe(0);
    expect(computeFraction(-1.5)).toBeCloseTo(-0.5);
  });
});
