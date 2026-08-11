import { describe, it, expect } from 'vitest';
import * as Skip from '../skip.js';

describe('skip', () => {
  it('exports a module', () => {
    expect(Skip).toBeDefined();
  });
});

