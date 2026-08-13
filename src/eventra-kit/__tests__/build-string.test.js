import { describe, it, expect } from 'vitest';
import * as BuildString from '../build-string.js';

describe('build-string', () => {
  it('exports a module', () => {
    expect(BuildString).toBeDefined();
  });
});

