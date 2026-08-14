import { describe, it, expect } from 'vitest';
import { diffByte } from '../diff-byte.js';

describe('diff-byte', () => {
  it('computes the absolute byte difference', () => {
    expect(diffByte(10, 4)).toBe(6);
    expect(diffByte(4, 10)).toBe(6);
    expect(diffByte(0, 0)).toBe(0);
  });
});
