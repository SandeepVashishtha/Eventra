import { describe, it, expect } from 'vitest';
import { chunkValue } from '../chunk-value.js';

describe('chunk-value', () => {
  it('chunks an array into sub-arrays of the given size', () => {
    expect(chunkValue([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(chunkValue([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
