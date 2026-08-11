import { describe, it, expect } from 'vitest';
import * as ShallowEqual from '../shallow-equal.js';

describe('shallow-equal', () => {
  it('exports a module', () => {
    expect(ShallowEqual).toBeDefined();
  });
});

