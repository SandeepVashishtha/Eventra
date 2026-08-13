import { describe, it, expect } from 'vitest';
import * as BuildQueue from '../build-queue.js';

describe('build-queue', () => {
  it('exports a module', () => {
    expect(BuildQueue).toBeDefined();
  });
});

