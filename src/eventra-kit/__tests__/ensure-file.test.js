import { describe, it, expect } from 'vitest';
import { ensureFile } from '../ensure-file.js';

describe('ensure-file', () => {
  it('coerces a value into a file path string', () => {
    expect(ensureFile(42)).toBe('42');
    expect(ensureFile('abc')).toBe('abc');
    expect(ensureFile(true)).toBe('true');
  });
});
