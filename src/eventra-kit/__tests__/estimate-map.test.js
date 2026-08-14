import { describe, it, expect } from 'vitest';
import { estimateMap } from '../estimate-map.js';

describe('estimate-map', () => {
  it('estimates the number of entries in a map or object', () => {
    expect(estimateMap({ a: 1, b: 2 })).toBe(2);
    expect(estimateMap(new Map([['a', 1], ['b', 2], ['c', 3]]))).toBe(3);
    expect(estimateMap({})).toBe(0);
  });
});
