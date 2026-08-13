import { describe, it, expect } from 'vitest';
import * as DedupePath from '../dedupe-path.js';

describe('dedupe-path', () => {
  it('exports a module', () => {
    expect(DedupePath).toBeDefined();
  });
});

