import { describe, it, expect } from 'vitest';
import { chunkList } from '../chunk-list.js';

describe('chunk-list', () => {
  it('chunks a list into groups of the given size', () => {
    expect(chunkList([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(chunkList([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    expect(chunkList([], 2)).toEqual([]);
  });
});
