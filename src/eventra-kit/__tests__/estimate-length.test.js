import { describe, it, expect } from 'vitest';
import { estimateLength } from '../estimate-length.js';

describe('estimate-length', () => {
  it('estimates the length of strings, arrays, and objects', () => {
    expect(estimateLength([1, 2, 3])).toBe(3);
    expect(estimateLength('hi')).toBe(2);
  });
});
