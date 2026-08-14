import { describe, it, expect } from 'vitest';
import { diffChar } from '../diff-char.js';

describe('diff-char', () => {
  it('computes the numeric difference between two characters', () => {
    expect(diffChar('a', 'c')).toBe(2);
    expect(diffChar('c', 'a')).toBe(2);
    expect(diffChar('a', 'a')).toBe(0);
  });
});
