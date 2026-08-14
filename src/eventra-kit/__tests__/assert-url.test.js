import { describe, it, expect } from 'vitest';
import { assertUrl } from '../assert-url.js';

describe('assert-url', () => {
  it('checks whether the input is a valid URL', () => {
    expect(assertUrl('https://example.com')).toBe(true);
    expect(assertUrl('http://localhost:3000')).toBe(true);
    expect(assertUrl('not-a-url')).toBe(false);
  });
});
