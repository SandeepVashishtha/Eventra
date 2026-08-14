import { describe, it, expect } from 'vitest';
import { countByte } from '../count-byte.js';

describe('count-byte', () => {
  it('counts the bytes of a value', () => {
    expect(countByte('abc')).toBe(3);
    expect(countByte('')).toBe(0);
    expect(countByte('é')).toBe(2);
  });
});
