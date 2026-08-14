import { describe, it, expect } from 'vitest';
import { averageDict } from '../average-dict.js';

describe('average-dict', () => {
  it('computes the average of dictionary values', () => {
    expect(averageDict({ a: 1, b: 3 })).toBe(2);
    expect(averageDict({ a: 10, b: 20 })).toBe(15);
    expect(averageDict({})).toBe(0);
  });
});
