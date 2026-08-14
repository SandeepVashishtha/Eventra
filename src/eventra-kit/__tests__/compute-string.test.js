import { describe, it, expect } from 'vitest';
import { computeString } from '../compute-string.js';

describe('compute-string', () => {
  it('returns the length of a string', () => {
    expect(computeString('hello')).toBe(5);
    expect(computeString('')).toBe(0);
  });
});
