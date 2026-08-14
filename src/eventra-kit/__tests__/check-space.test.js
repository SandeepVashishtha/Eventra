import { describe, it, expect } from 'vitest';
import { checkSpace } from '../check-space.js';

describe('check-space', () => {
  it('detects whitespace in a string', () => {
    expect(checkSpace('a b')).toBe(true);
    expect(checkSpace('ab')).toBe(false);
  });
});
