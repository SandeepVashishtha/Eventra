import { describe, it, expect } from 'vitest';
import { countLength } from '../count-length.js';

describe('count-length', () => {
  it('counts the length of strings, arrays, and objects', () => {
    expect(countLength('hello')).toBe(5);
    expect(countLength([1, 2, 3])).toBe(3);
    expect(countLength({ a: 1 })).toBe(1);
  });
});
