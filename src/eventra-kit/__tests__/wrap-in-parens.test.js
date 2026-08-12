import { describe, it, expect } from 'vitest';
import * as WrapInParens from '../wrap-in-parens.js';

describe('wrap-in-parens', () => {
  it('exports a module', () => {
    expect(WrapInParens).toBeDefined();
  });
});

