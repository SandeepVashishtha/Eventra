import { describe, it, expect } from 'vitest';
import { checkFraction } from '../check-fraction.js';

describe('check-fraction', () => {
  it('detects values that have a fractional part', () => {
    expect(checkFraction(0.5)).toBe(true);
    expect(checkFraction(-1.25)).toBe(true);
    expect(checkFraction(2)).toBe(false);
  });
});
