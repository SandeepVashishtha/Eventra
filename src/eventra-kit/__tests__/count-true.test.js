import { describe, it, expect } from 'vitest';
import * as CountTrue from '../count-true.js';

describe('count-true', () => {
  it('exports a module', () => {
    expect(CountTrue).toBeDefined();
  });
});

