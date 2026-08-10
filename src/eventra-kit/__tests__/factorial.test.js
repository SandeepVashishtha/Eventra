import { describe, it, expect } from 'vitest';
import * as Factorial from '../factorial.js';

describe('factorial', () => {
  it('exports a module', () => {
    expect(Factorial).toBeDefined();
  });
});

