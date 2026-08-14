import { describe, it, expect } from 'vitest';
import { buildHash } from '../build-hash.js';

describe('build-hash', () => {
  it('builds a numeric hash from a string', () => {
    expect(buildHash('abc')).toBe(294);
    expect(buildHash('a')).toBe(97);
    expect(buildHash('')).toBe(0);
  });
});
