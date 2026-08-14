import { describe, it, expect } from 'vitest';
import { countChar } from '../count-char.js';

describe('count-char', () => {
  it('counts the characters of a string', () => {
    expect(countChar('hello')).toBe(5);
    expect(countChar('')).toBe(0);
    expect(countChar(12345)).toBe(5);
  });
});
