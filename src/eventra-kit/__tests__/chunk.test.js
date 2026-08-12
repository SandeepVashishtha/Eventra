import { describe, it, expect } from 'vitest';
import * as Chunk from '../chunk.js';

describe('chunk', () => {
  it('exports a module', () => {
    expect(Chunk).toBeDefined();
  });
});

