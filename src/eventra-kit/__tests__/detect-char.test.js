import { describe, it, expect } from 'vitest';
import { detectChar } from '../detect-char.js';

describe('detect-char', () => {
  it('checks whether the input is a single character', () => {
    expect(detectChar('a')).toBe(true);
    expect(detectChar('😀')).toBe(true);
    expect(detectChar('abc')).toBe(false);
    expect(detectChar('')).toBe(false);
  });
});
