import { describe, it, expect } from 'vitest';
import { ensureNumber } from '../ensure-number.js';

describe('ensure-number', () => {
  it('parses a value into a number', () => {
    expect(ensureNumber('42')).toBe(42);
    expect(ensureNumber('12px')).toBe(12);
    expect(ensureNumber(3.5)).toBe(3.5);
    expect(ensureNumber('abc')).toBe(0);
  });
});
