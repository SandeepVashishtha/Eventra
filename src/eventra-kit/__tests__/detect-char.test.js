import { describe, it, expect } from 'vitest';
import { detectChar } from '../detect-char.js';

describe('detect-char', () => {
  it('detects whether a character is present', () => {
    expect(detectChar('hello', 'l')).toBe(true);
    expect(detectChar('abc', 'z')).toBe(false);
  });
});
