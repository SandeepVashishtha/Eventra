import { describe, it, expect } from 'vitest';
import { computeObject } from '../compute-object.js';

describe('compute-object', () => {
  it('counts the number of fields in an object', () => {
    expect(computeObject({ a: 1, b: 2 })).toBe(2);
    expect(computeObject({})).toBe(0);
    expect(computeObject(null)).toBe(0);
  });
});
