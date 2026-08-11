import { describe, it, expect } from 'vitest';
import * as Sample from '../sample.js';

describe('sample', () => {
  it('exports a module', () => {
    expect(Sample).toBeDefined();
  });
});

