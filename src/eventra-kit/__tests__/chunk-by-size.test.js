import { describe, it, expect } from 'vitest';
import * as ChunkBySize from '../chunk-by-size.js';

describe('chunk-by-size', () => {
  it('exports a module', () => {
    expect(ChunkBySize).toBeDefined();
  });
});

