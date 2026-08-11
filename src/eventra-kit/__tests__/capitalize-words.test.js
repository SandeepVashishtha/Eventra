import { describe, it, expect } from 'vitest';
import * as CapitalizeWords from '../capitalize-words.js';

describe('capitalize-words', () => {
  it('exports a module', () => {
    expect(CapitalizeWords).toBeDefined();
  });
});

