import { describe, it, expect } from 'vitest';
import * as AssertValue from '../assert-value.js';

describe('assert-value', () => {
  it('exports a module', () => {
    expect(AssertValue).toBeDefined();
  });
});

