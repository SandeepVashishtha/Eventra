import { describe, it, expect } from 'vitest';
import { createDict } from '../create-dict.js';

describe('create-dict', () => {
  it('builds a dictionary from key-value pairs', () => {
    expect(createDict([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
    expect(createDict([])).toEqual({});
  });
});
