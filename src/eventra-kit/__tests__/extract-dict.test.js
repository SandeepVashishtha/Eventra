import { describe, it, expect } from 'vitest';
import { extractDict } from '../extract-dict.js';

describe('extract-dict', () => {
  it('extracts the values of a dictionary', () => {
    expect(extractDict({ a: 1, b: 2 })).toEqual([1, 2]);
  });
});
