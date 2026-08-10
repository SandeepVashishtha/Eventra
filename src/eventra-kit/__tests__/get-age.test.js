import { describe, it, expect } from 'vitest';
import * as GetAge from '../get-age.js';

describe('get-age', () => {
  it('exports a module', () => {
    expect(GetAge).toBeDefined();
  });
});

