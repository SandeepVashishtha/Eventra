import { describe, it, expect } from 'vitest';
import * as ExtractChunk from '../extract-chunk.js';

describe('extract-chunk', () => {
  it('exports a module', () => {
    expect(ExtractChunk).toBeDefined();
  });
});

