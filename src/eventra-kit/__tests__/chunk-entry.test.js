import { describe, it, expect } from 'vitest';
import * as ChunkEntry from '../chunk-entry.js';

describe('chunk-entry', () => {
  it('exports a module', () => {
    expect(ChunkEntry).toBeDefined();
  });
});

