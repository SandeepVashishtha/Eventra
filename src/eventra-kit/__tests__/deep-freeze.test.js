import { describe, it, expect } from 'vitest';
import * as DeepFreeze from '../deep-freeze.js';

describe('deep-freeze', () => {
  it('exports a module', () => {
    expect(DeepFreeze).toBeDefined();
  });
});

