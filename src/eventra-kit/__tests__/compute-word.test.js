import { describe, it, expect } from 'vitest';
import { computeWord } from '../compute-word.js';

describe('compute-word', () => {
  it('counts the words of the input', () => {
    expect(computeWord('hello world')).toBe(2);
    expect(computeWord('')).toBe(0);
    expect(computeWord('one')).toBe(1);
  });
});
