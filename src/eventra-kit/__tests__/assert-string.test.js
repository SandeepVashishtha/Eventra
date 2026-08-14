import { describe, it, expect } from 'vitest';
import { assertString } from '../assert-string.js';

describe('assert-string', () => {
  it('checks whether the input is a string', () => {
    expect(assertString('abc')).toBe(true);
    expect(assertString(42)).toBe(false);
    expect(assertString(null)).toBe(false);
  });
});
