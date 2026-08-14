import { describe, it, expect } from 'vitest';
import { calculateLine } from '../calculate-line.js';

describe('calculate-line', () => {
  it('computes the length of a line string', () => {
    expect(calculateLine('hello')).toBe(5);
    expect(calculateLine('')).toBe(0);
    expect(calculateLine('a b')).toBe(3);
  });
});
