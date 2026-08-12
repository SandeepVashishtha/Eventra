import { describe, it, expect } from 'vitest';
import * as StripPunctuation from '../strip-punctuation.js';

describe('strip-punctuation', () => {
  it('exports a module', () => {
    expect(StripPunctuation).toBeDefined();
  });
});

