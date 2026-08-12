import { describe, it, expect } from 'vitest';
import * as AssertString from '../assert-string.js';

describe('assert-string', () => {
  it('exports a module', () => {
    expect(AssertString).toBeDefined();
  });
});

