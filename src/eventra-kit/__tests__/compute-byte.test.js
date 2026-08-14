import { describe, it, expect } from 'vitest';
import { computeByte } from '../compute-byte.js';

describe('compute-byte', () => {
  it('computes the UTF-8 byte length of a string', () => {
    expect(computeByte('abc')).toBe(3);
    expect(computeByte('é')).toBe(2);
    expect(computeByte('')).toBe(0);
  });
});
