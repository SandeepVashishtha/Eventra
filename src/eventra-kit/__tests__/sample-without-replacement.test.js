import { describe, it, expect } from 'vitest';
import * as SampleWithoutReplacement from '../sample-without-replacement.js';

describe('sample-without-replacement', () => {
  it('exports a module', () => {
    expect(SampleWithoutReplacement).toBeDefined();
  });
});

