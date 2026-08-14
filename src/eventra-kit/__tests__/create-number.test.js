import { describe, it, expect } from 'vitest';
import { createNumber } from '../create-number.js';

describe('create-number', () => {
  it('converts the input to a number', () => {
    expect(createNumber('42')).toBe(42);
    expect(createNumber('3.5')).toBe(3.5);
    expect(createNumber(7)).toBe(7);
  });
});
