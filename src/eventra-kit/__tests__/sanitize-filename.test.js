import { describe, it, expect } from 'vitest';
import * as SanitizeFilename from '../sanitize-filename.js';

describe('sanitize-filename', () => {
  it('exports a module', () => {
    expect(SanitizeFilename).toBeDefined();
  });
});

