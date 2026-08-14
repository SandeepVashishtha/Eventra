import { describe, it, expect } from 'vitest';
import { countNumber } from '../count-number.js';

describe('count-number', () => {
  it('counts numeric values in an array', () => {
    expect(countNumber([1, 2, 'x'])).toBe(2);
    expect(countNumber(['a', 'b'])).toBe(0);
  });
});
