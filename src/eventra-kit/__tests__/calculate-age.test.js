import { describe, it, expect } from 'vitest';
import * as CalculateAge from '../calculate-age.js';

describe('calculate-age', () => {
  it('exports a module', () => {
    expect(CalculateAge).toBeDefined();
  });
});

