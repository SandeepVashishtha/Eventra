import { describe, it, expect } from 'vitest';
import { convertArray } from '../convert-array.js';

describe('convert-array', () => {
  it('converts a value into an array', () => {
    expect(convertArray(5)).toEqual([5]);
    expect(convertArray('x')).toEqual(['x']);
    expect(convertArray([1, 2])).toEqual([1, 2]);
  });
});
