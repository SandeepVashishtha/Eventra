import { describe, it, expect } from 'vitest';
import * as ChunkName from '../chunk-name.js';

describe('chunk-name', () => {
  it('exports a module', () => {
    expect(ChunkName).toBeDefined();
  });
});

