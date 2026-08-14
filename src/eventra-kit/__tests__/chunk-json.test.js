import { describe, it, expect } from 'vitest';
import { chunkJson } from '../chunk-json.js';

describe('chunk-json', () => {
  it('splits an array into chunks', () => {
    expect(chunkJson([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(chunkJson([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });
});
