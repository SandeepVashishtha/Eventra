import { describe, it, expect } from 'vitest';
import { countMap } from '../count-map.js';

describe('count-map', () => {
  it('counts entries in a map or object', () => {
    expect(countMap({ a: 1, b: 2 })).toBe(2);
    expect(countMap(new Map([['a', 1], ['b', 2]]))).toBe(2);
    expect(countMap({})).toBe(0);
  });
});
