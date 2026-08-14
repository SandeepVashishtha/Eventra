import { describe, it, expect } from 'vitest';
import { countProp } from '../count-prop.js';

describe('count-prop', () => {
  it('counts the properties of an object', () => {
    expect(countProp({ a: 1, b: 2, c: 3 })).toBe(3);
    expect(countProp({})).toBe(0);
  });
});
