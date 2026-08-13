import { describe, it, expect } from 'vitest';
import * as ChunkCount from '../chunk-count.js';

describe('chunk-count', () => {
  it('exports a module', () => {
    expect(ChunkCount).toBeDefined();
  });
});

