import { describe, it, expect } from 'vitest';
import * as RootOf from '../root-of.js';

describe('root-of', () => {
  it('exports a module', () => {
    expect(RootOf).toBeDefined();
  });
});

