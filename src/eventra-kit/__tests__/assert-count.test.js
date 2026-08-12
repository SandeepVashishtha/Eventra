import { describe, it, expect } from 'vitest';
import * as AssertCount from '../assert-count.js';

describe('assert-count', () => {
  it('exports a module', () => {
    expect(AssertCount).toBeDefined();
  });
});

