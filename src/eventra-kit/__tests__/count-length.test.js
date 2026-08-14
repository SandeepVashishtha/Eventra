import { describe, it, expect } from 'vitest';
import { countLength } from '../count-length.js';

describe('count-length', () => {
  it('counts occurrences of the target in the value', () => {
    expect(countLength('banana', 'na')).toBe(2);
    expect(countLength('abc', 'x')).toBe(0);
    expect(countLength('aaa', 'a')).toBe(3);
  });
});
