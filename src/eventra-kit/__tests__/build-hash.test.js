import { describe, it, expect } from 'vitest';
import * as BuildHash from '../build-hash.js';

describe('build-hash', () => {
  it('exports a module', () => {
    expect(BuildHash).toBeDefined();
  });
});

