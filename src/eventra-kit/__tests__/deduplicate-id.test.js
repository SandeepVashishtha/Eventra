import { describe, it, expect } from 'vitest';
import * as DeduplicateId from '../deduplicate-id.js';

describe('deduplicate-id', () => {
  it('exports a module', () => {
    expect(DeduplicateId).toBeDefined();
  });
});

