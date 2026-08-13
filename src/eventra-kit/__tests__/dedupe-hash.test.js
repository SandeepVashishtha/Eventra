import { describe, it, expect } from 'vitest';
import * as DedupeHash from '../dedupe-hash.js';

describe('dedupe-hash', () => {
  it('exports a module', () => {
    expect(DedupeHash).toBeDefined();
  });
});

