import { describe, it, expect } from 'vitest';
import * as AssertName from '../assert-name.js';

describe('assert-name', () => {
  it('exports a module', () => {
    expect(AssertName).toBeDefined();
  });
});

