import { describe, it, expect } from 'vitest';
import { deduplicateChar } from '../deduplicate-char.js';

describe('deduplicate-char', () => {
  it('removes duplicate characters from a string', () => {
    expect(deduplicateChar('aabbcc')).toBe('abc');
    expect(deduplicateChar('abc')).toBe('abc');
    expect(deduplicateChar('')).toBe('');
  });
});
