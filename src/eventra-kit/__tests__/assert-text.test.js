import { describe, it, expect } from 'vitest';
import * as AssertText from '../assert-text.js';

describe('assert-text', () => {
  it('exports a module', () => {
    expect(AssertText).toBeDefined();
  });
});

