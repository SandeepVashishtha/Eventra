import { describe, it, expect } from 'vitest';
import { ensureString } from '../ensure-string.js';

describe('ensure-string', () => {
  it('coerces a value into a string', () => {
    expect(ensureString(42)).toBe('42');
    expect(ensureString('abc')).toBe('abc');
    expect(ensureString(true)).toBe('true');
  });
});
