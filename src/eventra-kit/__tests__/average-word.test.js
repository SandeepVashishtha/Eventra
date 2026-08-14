import { describe, it, expect } from 'vitest';
import { averageWord } from '../average-word.js';

describe('average-word', () => {
  it('computes the average word length of a text', () => {
    expect(averageWord('hello world')).toBe(5);
    expect(averageWord('a bb')).toBe(1.5);
    expect(averageWord('')).toBe(0);
  });
});
