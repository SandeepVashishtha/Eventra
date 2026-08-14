import { describe, it, expect } from 'vitest';
import { dedupeHash } from '../dedupe-hash.js';

describe('dedupe-hash', () => {
  it('removes duplicate values from an array', () => {
    expect(dedupeHash([1, 1, 2, 2])).toEqual([1, 2]);
    expect(dedupeHash(['a', 'a', 'b'])).toEqual(['a', 'b']);
    expect(dedupeHash([])).toEqual([]);
  });
});
