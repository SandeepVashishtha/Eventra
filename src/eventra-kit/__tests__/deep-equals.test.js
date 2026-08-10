import { describe, it, expect } from 'vitest';
import * as DeepEquals from '../deep-equals.js';

describe('deep-equals', () => {
  it('exports a module', () => {
    expect(DeepEquals).toBeDefined();
  });
});

