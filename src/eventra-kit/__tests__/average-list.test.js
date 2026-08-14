import { describe, it, expect } from 'vitest';
import { averageList } from '../average-list.js';

describe('average-list', () => {
  it('computes the average of a list', () => {
    expect(averageList([1, 2, 3])).toBe(2);
    expect(averageList([10, 20])).toBe(15);
    expect(averageList([])).toBe(0);
  });
});
