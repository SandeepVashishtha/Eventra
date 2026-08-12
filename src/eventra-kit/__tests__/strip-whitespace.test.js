import { describe, it, expect } from 'vitest';
import * as StripWhitespace from '../strip-whitespace.js';

describe('strip-whitespace', () => {
  it('exports a module', () => {
    expect(StripWhitespace).toBeDefined();
  });
});

