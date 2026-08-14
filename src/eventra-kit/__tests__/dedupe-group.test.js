import { describe, it, expect } from 'vitest';
import { dedupeGroup } from '../dedupe-group.js';

describe('dedupe-group', () => {
  it('removes duplicate values', () => {
    expect(dedupeGroup([1, 1, 2])).toEqual([1, 2]);
    expect(dedupeGroup(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });
});
