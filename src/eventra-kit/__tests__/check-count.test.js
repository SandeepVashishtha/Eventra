import { describe, it, expect } from 'vitest';
import { checkCount } from '../check-count.js';

describe('check-count', () => {
  it('checks whether the input count is positive', () => {
    expect(checkCount(5)).toBe(true);
    expect(checkCount(0)).toBe(false);
    expect(checkCount(-3)).toBe(false);
  });
});
