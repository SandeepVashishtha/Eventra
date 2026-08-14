import { describe, it, expect } from 'vitest';
import { detectString } from '../detect-string.js';

describe('detect-string', () => {
  it('detects string values', () => {
    expect(detectString('abc')).toBe(true);
    expect(detectString('')).toBe(true);
    expect(detectString(42)).toBe(false);
    expect(detectString(null)).toBe(false);
  });
});
