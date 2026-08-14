import { describe, it, expect } from 'vitest';
import { computeChar } from '../compute-char.js';

describe('compute-char', () => {
  it('returns the first character of the input', () => {
    expect(computeChar('hello')).toBe('h');
    expect(computeChar('')).toBe('');
    expect(computeChar(42)).toBe('4');
  });
});
