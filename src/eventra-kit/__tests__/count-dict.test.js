import { describe, it, expect } from 'vitest';
import { countDict } from '../count-dict.js';

describe('count-dict', () => {
  it('counts the entries of a dictionary', () => {
    expect(countDict({ a: 1, b: 2 })).toBe(2);
    expect(countDict({})).toBe(0);
    expect(countDict(null)).toBe(0);
  });
});
