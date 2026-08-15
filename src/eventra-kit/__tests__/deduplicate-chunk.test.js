import { describe, it, expect } from 'vitest';
import * as DeduplicateChunk from '../deduplicate-chunk.js';

describe('deduplicate-chunk', () => {
  it('exports a module', () => {
    expect(DeduplicateChunk).toBeDefined();
  });
});

