import { describe, it, expect } from 'vitest';
import * as CalculateName from '../calculate-name.js';

describe('calculate-name', () => {
  it('exports a module', () => {
    expect(CalculateName).toBeDefined();
  });
});

