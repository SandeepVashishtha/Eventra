import { describe, it, expect } from 'vitest';
import { diffChar } from '../diff-char.js';

describe('diff-char', () => {
  it('computes the difference in character counts', () => {
    expect(diffChar('abcd', 'ab')).toBe(2);
    expect(diffChar('ab', 'abcd')).toBe(2);
    expect(diffChar('abc', 'abc')).toBe(0);
  });
});
