import { describe, it, expect } from 'vitest';
import * as DeepClone from '../deep-clone.js';

describe('deep-clone', () => {
  it('exports a module', () => {
    expect(DeepClone).toBeDefined();
  });
});

