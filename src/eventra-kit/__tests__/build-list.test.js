import { describe, it, expect } from 'vitest';
import { buildList } from '../build-list.js';

describe('build-list', () => {
  it('splits a string into a list', () => {
    expect(buildList('a,b,c', ',')).toEqual(['a', 'b', 'c']);
    expect(buildList('x y z')).toEqual(['x', 'y', 'z']);
  });
});
