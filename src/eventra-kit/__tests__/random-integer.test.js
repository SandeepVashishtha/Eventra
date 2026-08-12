import { describe, it, expect } from 'vitest';
import * as RandomInteger from '../random-integer.js';

describe('random-integer', () => {
  it('exports a module', () => {
    expect(RandomInteger).toBeDefined();
  });
});

