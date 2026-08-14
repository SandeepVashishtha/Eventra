import { describe, it, expect } from 'vitest';
import { clampString } from '../clamp-string.js';

describe('clamp-string', () => {
  it('clamps a string to a maximum length', () => {
    expect(clampString('hello world', 5)).toBe('hello');
    expect(clampString('hi', 5)).toBe('hi');
    expect(clampString('hello', 0)).toBe('');
  });
});
