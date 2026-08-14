import { describe, it, expect } from 'vitest';
import { assertList } from '../assert-list.js';

describe('assert-list', () => {
  it('checks whether the input is a list', () => {
    expect(assertList([1, 2])).toBe(true);
    expect(assertList('abc')).toBe(false);
    expect(assertList({})).toBe(false);
  });
});
