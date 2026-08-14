import { describe, it, expect } from 'vitest';
import * as DeduplicateCount from '../deduplicate-count.js';

describe('deduplicate-count', () => {
  it('exports a module', () => {
    expect(DeduplicateCount).toBeDefined();
  });
});

