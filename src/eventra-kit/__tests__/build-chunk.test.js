import { describe, it, expect } from 'vitest';
import * as BuildChunk from '../build-chunk.js';

describe('build-chunk', () => {
  it('exports a module', () => {
    expect(BuildChunk).toBeDefined();
  });
});

