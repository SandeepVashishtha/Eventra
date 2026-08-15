import { describe, it, expect } from 'vitest';
import * as DeduplicateUrl from '../deduplicate-url.js';

describe('deduplicate-url', () => {
  it('exports a module', () => {
    expect(DeduplicateUrl).toBeDefined();
  });
});

