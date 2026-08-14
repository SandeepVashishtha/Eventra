import { describe, it, expect } from 'vitest';
import { convertMap } from '../convert-map.js';

describe('convert-map', () => {
  it('converts an object into a Map', () => {
    expect([...convertMap({ a: 1, b: 2 })]).toEqual([['a', 1], ['b', 2]]);
    expect([...convertMap({})]).toEqual([]);
  });
});
