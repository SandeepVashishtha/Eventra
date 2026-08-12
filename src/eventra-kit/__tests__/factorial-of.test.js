import { describe, it, expect } from 'vitest';
import * as FactorialOf from '../factorial-of.js';

describe('factorial-of', () => {
  it('exports a module', () => {
    expect(FactorialOf).toBeDefined();
  });
});

