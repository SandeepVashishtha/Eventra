import { describe, it, expect } from 'vitest';
import * as FnvHash from '../fnv-hash.js';

describe('fnv-hash', () => {
  it('exports a module', () => {
    expect(FnvHash).toBeDefined();
  });
});

