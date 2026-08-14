import { describe, it, expect } from 'vitest';
import { countChar } from '../count-char.js';

describe('count-char', () => {
  it('counts occurrences of a character', () => {
    expect(countChar('banana', 'a')).toBe(3);
    expect(countChar('hello', 'l')).toBe(2);
    expect(countChar('abc', 'z')).toBe(0);
  });
});
