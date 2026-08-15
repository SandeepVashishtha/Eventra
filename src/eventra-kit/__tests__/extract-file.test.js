import { describe, it, expect } from 'vitest';
import * as ExtractFile from '../extract-file.js';

describe('extract-file', () => {
  it('exports a module', () => {
    expect(ExtractFile).toBeDefined();
  });
});

