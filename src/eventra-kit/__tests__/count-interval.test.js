import { describe, it, expect } from 'vitest';
import { countInterval } from '../count-interval.js';

describe('count-interval', () => {
  it('counts the integers between two bounds', () => {
    expect(countInterval(2, 5)).toBe(4);
    expect(countInterval(5, 5)).toBe(1);
    expect(countInterval(5, 2)).toBe(4);
  });
});
