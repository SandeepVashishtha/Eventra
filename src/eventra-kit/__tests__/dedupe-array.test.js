import { describe, it, expect } from 'vitest';
import { dedupeArray } from '../dedupe-array.js';

describe('dedupe-array', () => {
  it('removes duplicate values from an array', () => {
    expect(dedupeArray([1, 1, 2, 2])).toEqual([1, 2]);
    expect(dedupeArray(['a', 'a', 'b'])).toEqual(['a', 'b']);
    expect(dedupeArray([])).toEqual([]);
  });
});
