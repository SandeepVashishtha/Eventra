import { describe, it, expect } from 'vitest';
import { computeTriple } from '../compute-triple.js';

describe('compute-triple', () => {
  it('computes the triple of a value', () => {
    expect(computeTriple(4)).toBe(12);
    expect(computeTriple(0)).toBe(0);
    expect(computeTriple(-2)).toBe(-6);
  });
});
