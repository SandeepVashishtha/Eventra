import { describe, it, expect } from 'vitest';
import { estimateProp } from '../estimate-prop.js';

describe('estimate-prop', () => {
  it('estimates the number of properties of an object', () => {
    expect(estimateProp({ a: 1, b: 2 })).toBe(2);
    expect(estimateProp({})).toBe(0);
    expect(estimateProp(null)).toBe(0);
  });
});
