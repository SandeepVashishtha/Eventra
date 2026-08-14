import { describe, it, expect } from 'vitest';
import { extractKey } from '../extract-key.js';

describe('extract-key', () => {
  it('extracts the values of a key from each item', () => {
    expect(extractKey([{ id: 1 }, { id: 2 }], 'id')).toEqual([1, 2]);
    expect(extractKey([], 'id')).toEqual([]);
  });
});
