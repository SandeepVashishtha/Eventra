import { describe, it, expect } from 'vitest';
import { assertMap } from '../assert-map.js';

describe('assert-map', () => {
  it('checks whether the input is an object', () => {
    expect(assertMap({ a: 1 })).toBe(true);
    expect(assertMap(null)).toBe(false);
    expect(assertMap([1, 2])).toBe(false);
  });
});
