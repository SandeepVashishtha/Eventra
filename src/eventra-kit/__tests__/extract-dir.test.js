import { describe, it, expect } from 'vitest';
import { extractDir } from '../extract-dir.js';

describe('extract-dir', () => {
  it('returns the directory part of a path', () => {
    expect(extractDir('/home/user/docs/report.txt')).toBe('/home/user/docs');
    expect(extractDir('a/b/c')).toBe('a/b');
    expect(extractDir('report.txt')).toBe('');
  });
});
