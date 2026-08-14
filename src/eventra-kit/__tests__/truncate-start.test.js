import { describe, it, expect } from 'vitest';
import { truncateStart } from '../truncate-start.js';

describe('truncate-start', () => {
  it('never exceeds the max length', () => {
    expect(truncateStart('abcdef', 2)).toBe('..');
    expect(truncateStart('abcdef', 3)).toBe('...');
    expect(truncateStart('abcdef', 5)).toBe('...ef');
    expect(truncateStart('abc', 5)).toBe('abc');
  });
});
