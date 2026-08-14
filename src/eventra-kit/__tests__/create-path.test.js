import { describe, it, expect } from 'vitest';
import { createPath } from '../create-path.js';

describe('create-path', () => {
  it('joins path segments', () => {
    expect(createPath(['a', 'b'])).toBe('a/b');
  });
});
