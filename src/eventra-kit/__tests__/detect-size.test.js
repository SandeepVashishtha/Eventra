import { describe, it, expect } from 'vitest';
import { detectSize } from '../detect-size.js';

describe('detect-size', () => {
  it('returns the size of the input', () => {
    expect(detectSize([1, 2, 3])).toBe(3);
    expect(detectSize('hello')).toBe(5);
    expect(detectSize(12345)).toBe(5);
  });
});
