import { describe, it, expect } from 'vitest';
import * as Sum from '../sum.js';

describe('sum', () => {
  it('exports a module', () => {
    expect(Sum).toBeDefined();
  });
});

