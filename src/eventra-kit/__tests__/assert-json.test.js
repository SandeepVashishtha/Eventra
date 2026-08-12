import { describe, it, expect } from 'vitest';
import * as AssertJson from '../assert-json.js';

describe('assert-json', () => {
  it('exports a module', () => {
    expect(AssertJson).toBeDefined();
  });
});

