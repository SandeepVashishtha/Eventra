import { describe, it, expect } from 'vitest';
import * as AssertNumber from '../assert-number.js';

describe('assert-number', () => {
  it('exports a module', () => {
    expect(AssertNumber).toBeDefined();
  });
});

