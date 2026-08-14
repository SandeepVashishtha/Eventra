import { describe, it, expect } from 'vitest';
import { buildPage } from '../build-page.js';

describe('build-page', () => {
  it('builds pages of items of the given size', () => {
    expect(buildPage([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(buildPage([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(buildPage([], 2)).toEqual([]);
  });
});
