import { describe, it, expect } from 'vitest';
import * as EmptyFunction from '../empty-function.js';

describe('empty-function', () => {
  it('exports a module', () => {
    expect(EmptyFunction).toBeDefined();
  });
});

