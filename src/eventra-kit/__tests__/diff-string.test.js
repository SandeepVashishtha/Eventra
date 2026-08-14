import { describe, it, expect } from 'vitest';
import { diffString } from '../diff-string.js';

describe('diff-string', () => {
  it('removes the characters of the second string from the first', () => {
    expect(diffString('hello', 'l')).toBe('heo');
    expect(diffString('banana', 'an')).toBe('b');
    expect(diffString('abc', 'xyz')).toBe('abc');
  });
});
