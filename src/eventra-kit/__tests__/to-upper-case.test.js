import { describe, it, expect } from 'vitest';
import * as ToUpperCase from '../to-upper-case.js';

describe('to-upper-case', () => {
  it('exports a module', () => {
    expect(ToUpperCase).toBeDefined();
  });
});

