import { describe, it, expect } from 'vitest';
import * as DeduplicatePath from '../deduplicate-path.js';

describe('deduplicate-path', () => {
  it('exports a module', () => {
    expect(DeduplicatePath).toBeDefined();
  });
});

