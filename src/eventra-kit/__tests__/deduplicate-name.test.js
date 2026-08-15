import { describe, it, expect } from 'vitest';
import * as DeduplicateName from '../deduplicate-name.js';

describe('deduplicate-name', () => {
  it('exports a module', () => {
    expect(DeduplicateName).toBeDefined();
  });
});

