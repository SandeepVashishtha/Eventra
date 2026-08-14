import { describe, it, expect } from 'vitest';
import { extractFile } from '../extract-file.js';

describe('extract-file', () => {
  it('extracts the file name from a path', () => {
    expect(extractFile('/home/user/docs/report.txt')).toBe('report.txt');
    expect(extractFile('a/b/c')).toBe('c');
    expect(extractFile('report.txt')).toBe('report.txt');
  });
});
