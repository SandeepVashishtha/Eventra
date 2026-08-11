import { describe, it, expect } from 'vitest';
import * as AssertBox from '../assert-box.js';

describe('assert-box', () => {
  it('exports a module', () => {
    expect(AssertBox).toBeDefined();
  });
});

