import { describe, it, expect } from 'vitest';
import * as DedupeChunk from '../dedupe-chunk.js';

describe('dedupe-chunk', () => {
  it('exports a module', () => {
    expect(DedupeChunk).toBeDefined();
  });
});

