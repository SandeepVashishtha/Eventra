import { describe, it, expect } from 'vitest';
import * as MedianLow from '../median-low.js';
import { medianLow } from '../median-low.js';
import { medianHigh } from '../median-high.js';

describe('median-low', () => {
  it('exports a module', () => {
    expect(MedianLow).toBeDefined();
  });

  it('returns the exact middle element for an odd-length array', () => {
    expect(medianLow([5, 1, 3, 2, 4])).toBe(3);
  });

  it('returns the lower-middle value for an even-length array (#17542)', () => {
    expect(medianLow([1, 2, 3, 4])).toBe(2);
    expect(medianLow([10, 20])).toBe(10);
    expect(medianLow([1, 2, 3, 4, 5, 6])).toBe(3);
  });

  it('does not mutate the input array', () => {
    const input = [3, 1, 2];
    const snapshot = [...input];
    medianLow(input);
    expect(input).toEqual(snapshot);
  });

  it('sorts numerically (not lexicographically)', () => {
    expect(medianLow([10, 2, 8, 4, 6])).toBe(6);
    expect(medianLow([10, 2, 8, 4])).toBe(4);
  });

  it('returns undefined for an empty array', () => {
    expect(medianLow([])).toBeUndefined();
  });

  it('returns a different value than medianHigh for even-length arrays', () => {
    const data = [1, 2, 3, 4];
    expect(medianLow(data)).toBe(2);
    expect(medianHigh(data)).toBe(3);
    expect(medianLow(data)).not.toBe(medianHigh(data));
  });
});

