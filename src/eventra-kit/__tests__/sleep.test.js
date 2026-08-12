import { describe, it, expect } from 'vitest';
import * as Sleep from '../sleep.js';

describe('sleep', () => {
  it('exports a module', () => {
    expect(Sleep).toBeDefined();
  });
});

