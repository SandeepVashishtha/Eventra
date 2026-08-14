import { describe, it, expect } from 'vitest';
import { checkHash } from '../check-hash.js';

describe('check-hash', () => {
  it('checks whether the input is a valid hash string', () => {
    expect(checkHash('a1b2c3')).toBe(true);
    expect(checkHash('DEADBEEF')).toBe(true);
    expect(checkHash('zz!!')).toBe(false);
  });
});
