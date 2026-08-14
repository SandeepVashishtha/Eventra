import { describe, it, expect } from 'vitest';
import { estimateChar } from '../estimate-char.js';

describe('estimate-char', () => {
  it('estimates the character count of a string', () => {
    expect(estimateChar('hello')).toBe(5);
    expect(estimateChar('')).toBe(0);
    expect(estimateChar(12345)).toBe(5);
  });
});
