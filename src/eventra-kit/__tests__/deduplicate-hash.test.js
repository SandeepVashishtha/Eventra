import { describe, it, expect } from 'vitest';
import * as DeduplicateHash from '../deduplicate-hash.js';

describe('deduplicate-hash', () => {
  it('exports a module', () => {
    expect(DeduplicateHash).toBeDefined();
  });
});

