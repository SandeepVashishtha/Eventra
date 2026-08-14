import { describe, it, expect } from 'vitest';
import { detectFile } from '../detect-file.js';

describe('detect-file', () => {
  it('detects the file name from a path', () => {
    expect(detectFile('/a/b/c.txt')).toBe('c.txt');
    expect(detectFile('dir/file')).toBe('file');
    expect(detectFile('report.txt')).toBe('report.txt');
  });
});
