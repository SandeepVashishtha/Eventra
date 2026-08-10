import { describe, it, expect } from 'vitest';
import * as Init from '../init.js';

describe('init', () => {
  it('exports a module', () => {
    expect(Init).toBeDefined();
  });
});

