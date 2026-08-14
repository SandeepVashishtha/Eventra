import { describe, it, expect } from 'vitest';
import { deduplicateItem } from '../deduplicate-item.js';

describe('deduplicate-item', () => {
  it('removes duplicate items while preserving order', () => {
    expect(deduplicateItem([1, 1, 2, 3])).toEqual([1, 2, 3]);
    expect(deduplicateItem([1, 2])).toEqual([1, 2]);
    expect(deduplicateItem([])).toEqual([]);
  });
});
