import { describe, it, expect } from 'vitest';
import { detectArray } from '../detect-array.js';

describe('detect-array', () => {
  it('checks whether the input is an array', () => {
    expect(detectArray([1, 2])).toBe(true);
    expect(detectArray([])).toBe(true);
    expect(detectArray('abc')).toBe(false);
  });
});
