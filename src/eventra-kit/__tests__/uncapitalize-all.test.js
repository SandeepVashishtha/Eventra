import { describe, it, expect } from 'vitest';
import * as UncapitalizeAll from '../uncapitalize-all.js';

describe('uncapitalize-all', () => {
  it('exports a module', () => {
    expect(UncapitalizeAll).toBeDefined();
  });
});

