import { describe, it, expect } from 'vitest';
import * as IncrementId from '../increment-id.js';

describe('increment-id', () => {
  it('exports a module', () => {
    expect(IncrementId).toBeDefined();
  });
});

