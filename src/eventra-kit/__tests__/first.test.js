import { describe, it, expect } from 'vitest';
import * as First from '../first.js';

describe('first', () => {
  it('exports a module', () => {
    expect(First).toBeDefined();
  });
});

