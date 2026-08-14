import { describe, it, expect } from 'vitest';
import { extractPath } from '../extract-path.js';

describe('extract-path', () => {
  it('extracts the path from a URL', () => {
    expect(extractPath('https://x.com/a/b?q=1')).toBe('/a/b');
  });
});
