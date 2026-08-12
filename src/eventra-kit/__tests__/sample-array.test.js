import { describe, it, expect } from 'vitest';
import * as SampleArray from '../sample-array.js';

describe('sample-array', () => {
  it('exports a module', () => {
    expect(SampleArray).toBeDefined();
  });
});

