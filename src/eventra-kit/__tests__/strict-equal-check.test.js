import { describe, it, expect } from 'vitest';
import * as StrictEqualCheck from '../strict-equal-check.js';

describe('strict-equal-check', () => {
  it('exports a module', () => {
    expect(StrictEqualCheck).toBeDefined();
  });
});

