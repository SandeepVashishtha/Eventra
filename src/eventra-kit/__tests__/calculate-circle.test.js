import { describe, it, expect } from 'vitest';
import { calculateCircle } from '../calculate-circle.js';

describe('calculate-circle', () => {
  it('computes the area of a circle', () => {
    expect(calculateCircle(1)).toBe(Math.PI);
    expect(calculateCircle(2)).toBe(Math.PI * 4);
    expect(calculateCircle(0)).toBe(0);
  });
});
